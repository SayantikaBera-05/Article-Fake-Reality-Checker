"""
Image SSE Streaming Route — POST /image/stream + GET /image-checker

Streams real-time Server-Sent Events as the image reality check pipeline
progresses through each stage. Self-contained HTML UI served at /image-checker.

Pipeline Stages (4-stage RAG pipeline):
    1. EXTRACTING_CONTENT  → OCR or LLaMA Vision fallback
    2. SEARCHING_EVIDENCE  → Scout: Serper.dev web search
    3. SCRAPING_SOURCES    → Reader: Jina AI scrapes top sources
    4. VERIFYING_REALITY   → Analyst: Evidence-backed forensic verification
    5. COMPLETED/ERROR     → Final verdict or error

Author: Joy-S-07
"""

import json
import traceback
from typing import AsyncGenerator

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import HTMLResponse, StreamingResponse

from app.config import settings
from app.services.image_analyzer import ImageContentExtractor
from app.services.scout import Scout
from app.services.reader import Reader
from app.services.analyst import Analyst
from app.schemas.image_detection import (
    ImageAnalysisResult,
    ImageVerdict,
    ImageConfidenceLevel,
)
from app.schemas.detection import SourceReference, AuditTrail

router = APIRouter()

# Lazy-initialized pipeline agents (avoids import-time crash if keys are missing)
_scout: Scout | None = None
_reader: Reader | None = None
_analyst: Analyst | None = None


def _get_scout() -> Scout:
    global _scout
    if _scout is None:
        _scout = Scout()
    return _scout


def _get_reader() -> Reader:
    global _reader
    if _reader is None:
        _reader = Reader()
    return _reader


def _get_analyst() -> Analyst:
    global _analyst
    if _analyst is None:
        _analyst = Analyst()
    return _analyst


# ─── SSE Helpers ────────────────────────────────────

def sse_event(event: str, data: dict) -> str:
    json_data = json.dumps(data, default=str)
    return f"event: {event}\ndata: {json_data}\n\n"


def sse_stage(stage: str, sequence: int, text: str) -> str:
    return sse_event("stage", {
        "stage": stage,
        "sequence": sequence,
        "text": text,
    })


# ─── Image Pipeline SSE Generator ──────────────────

async def image_pipeline_stream(
    image_bytes: bytes,
    filename: str,
) -> AsyncGenerator[str, None]:
    """
    Async generator that runs the 4-stage image reality check pipeline
    and yields SSE events at each transition.

    Pipeline:
        1. EXTRACTING_CONTENT → OCR / Vision extraction
        2. SEARCHING_EVIDENCE → Serper.dev web search
        3. SCRAPING_SOURCES   → Jina AI Reader
        4. VERIFYING_REALITY  → Analyst cross-examination with evidence
    """
    try:

        # ── Stage 1: Content Extraction ────────────
        yield sse_stage("EXTRACTING_CONTENT", 1, "Extracting text and content from image...")

        extractor = ImageContentExtractor()
        extraction = await extractor.extract(image_bytes)

        yield sse_event("extraction", {
            "method": extraction.method,
            "success": extraction.success,
            "preview": extraction.extracted_text[:200] if extraction.extracted_text else "",
        })

        if not extraction.success or not extraction.extracted_text:
            result = ImageAnalysisResult(
                verdict=ImageVerdict.UNVERIFIABLE,
                verificationStatus="UNVERIFIABLE",
                isFraud=False,
                riskScore=30,
                confidenceLevel=ImageConfidenceLevel.LOW,
                flags=["No text or meaningful content could be extracted"],
                analysisSummary=(
                    "The image does not contain readable text and the vision model "
                    "could not extract meaningful content for verification."
                ),
                extractionMethod=extraction.method,
                extractedContent=None,
            )
            yield sse_event("completed", result.model_dump())
            return

        extracted_content = extraction.extracted_text
        claim = extracted_content  # The extracted content IS the claim to verify

        print(f"\n{'═' * 60}")
        print(f"[IMAGE PIPELINE] Content extracted ({extraction.method}): {claim[:100]}...")
        print(f"{'═' * 60}")

        # ── Stage 2: Search for Evidence (News-First) ─────
        yield sse_stage("SEARCHING_EVIDENCE", 2, "Searching news & web for evidence...")

        search_results = []
        serper_query = f"fact check {claim.strip()[:300]}"

        # Search for evidence via Serper web search
        scout = _get_scout()
        if scout.is_available:
            try:
                print(f"\n{'═' * 60}")
                print(f"[IMAGE PIPELINE] Stage 2b — WEB SEARCH (Serper.dev)...")
                print(f"{'═' * 60}")
                search_results = await scout.search(claim)
            except Exception as e:
                print(f"[IMAGE PIPELINE] WARNING: Serper failed: {type(e).__name__}: {e}")
                traceback.print_exc()

        print(f"[IMAGE PIPELINE] Total search results: {len(search_results)}")

        # ── Stage 3: Scrape Sources (Jina AI) ──────────
        yield sse_stage("SCRAPING_SOURCES", 3, "Reading and analyzing source content...")

        evidence = []
        if search_results:
            try:
                print(f"\n{'═' * 60}")
                print(f"[IMAGE PIPELINE] Stage 3 — READER: Scraping top sources via Jina AI...")
                print(f"{'═' * 60}")
                urls = [r.url for r in search_results if r.url]
                evidence = await _get_reader().scrape_multiple(urls, max_sources=3)
                print(f"[IMAGE PIPELINE] Scraped {len(evidence)} sources successfully")
            except Exception as e:
                print(f"[IMAGE PIPELINE] WARNING: Reader failed: {type(e).__name__}: {e}")
                traceback.print_exc()

        # ── Stage 4: Analyst Cross-Examination ─────────
        mode = "EVIDENCE-BACKED" if evidence else "NO-EVIDENCE"
        yield sse_stage("VERIFYING_REALITY", 4, f"Cross-referencing content ({mode})...")

        print(f"\n{'═' * 60}")
        print(f"[IMAGE PIPELINE] Stage 4 — ANALYST: {mode} forensic verification...")
        print(f"{'═' * 60}")

        verdict = await _get_analyst().investigate(
            claim=claim,
            evidence=evidence if evidence else None,
            search_results=search_results if search_results else None,
            serper_query=serper_query,
        )

        print(f"\n{'═' * 60}")
        print(f"[IMAGE PIPELINE] VERDICT: {verdict.verificationStatus} "
              f"(risk: {verdict.riskScore}/100, confidence: {verdict.confidenceLevel.value})")
        print(f"{'═' * 60}\n")

        # ── Map FraudDetectionResponse → ImageAnalysisResult ──
        verdict_map = {
            "VERIFIED": ImageVerdict.VERIFIED_REAL,
            "CONTRADICTED": ImageVerdict.MISLEADING,
        }
        image_verdict = verdict_map.get(verdict.verificationStatus, ImageVerdict.UNVERIFIABLE)

        # Build sources list from verdict
        sources_list = []
        if verdict.sources:
            sources_list = [
                SourceReference(
                    title=s.title,
                    url=s.url,
                    snippet=s.snippet,
                )
                for s in verdict.sources
            ]

        # Build audit trail
        audit_trail = None
        if verdict.auditTrail:
            audit_trail = AuditTrail(
                serperQuery=verdict.auditTrail.serperQuery,
                jinaUrlsProcessed=verdict.auditTrail.jinaUrlsProcessed,
                openrouterModel=verdict.auditTrail.openrouterModel,
            )

        result = ImageAnalysisResult(
            verdict=image_verdict,
            verificationStatus=verdict.verificationStatus,
            isFraud=verdict.isFraud,
            riskScore=verdict.riskScore,
            confidenceLevel=ImageConfidenceLevel(verdict.confidenceLevel.value),
            flags=verdict.flags,
            analysisSummary=verdict.analysisSummary,
            extractionMethod=extraction.method,
            extractedContent=extracted_content,
            evidenceTimeline=verdict.evidenceTimeline,
            sources=sources_list,
            auditTrail=audit_trail,
        )

        yield sse_event("completed", result.model_dump())

    except Exception as e:
        print(f"[IMAGE PIPELINE] ERROR: {type(e).__name__}: {e}")
        traceback.print_exc()
        yield sse_event("error", {
            "message": f"Pipeline error: {type(e).__name__}: {str(e)}",
        })


# ─── POST /image/stream ───────────────────────────

@router.post("/image/stream")
async def image_stream(
    image: UploadFile = File(...),
):
    """
    Accept an image upload, run the image reality check pipeline,
    and stream SSE events in real-time.
    """
    # Validate file type
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if image.content_type not in allowed:
        async def error_gen():
            yield sse_event("error", {"message": f"Unsupported file type: {image.content_type}. Use JPEG, PNG, WebP, or GIF."})
        return StreamingResponse(error_gen(), media_type="text/event-stream")

    # Read image bytes (limit 10MB)
    image_bytes = await image.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        async def error_gen():
            yield sse_event("error", {"message": "Image too large. Maximum size is 10MB."})
        return StreamingResponse(error_gen(), media_type="text/event-stream")

    filename = image.filename or "upload.jpg"

    return StreamingResponse(
        image_pipeline_stream(image_bytes, filename),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ─── GET /image-checker (Self-contained HTML UI) ──

@router.get("/image-checker", response_class=HTMLResponse)
async def image_checker_ui():
    """Serve the self-contained Image Reality Checker HTML UI."""
    return HTMLResponse(content=IMAGE_CHECKER_HTML)


# ═══════════════════════════════════════════════════════
# HTML UI — Inline Template
# ═══════════════════════════════════════════════════════

IMAGE_CHECKER_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Image Reality Checker</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0f;--surface:#12121a;--surface2:#1a1a28;--border:#2a2a40;
  --text:#e4e4ed;--text2:#9090a8;--accent:#6c5ce7;--accent2:#a29bfe;
  --green:#00cec9;--red:#ff6b6b;--orange:#fdcb6e;--blue:#74b9ff;
  --radius:12px;--shadow:0 8px 32px rgba(0,0,0,0.4);
}
body{
  font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  padding:20px;
}
.container{max-width:680px;width:100%}
h1{
  font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:6px;
  background:linear-gradient(135deg,var(--accent2),var(--green));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.subtitle{text-align:center;color:var(--text2);font-size:.9rem;margin-bottom:28px}

/* ─── Upload Card ─── */
.card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);padding:28px;box-shadow:var(--shadow);
  margin-bottom:20px;
}
.dropzone{
  border:2px dashed var(--border);border-radius:var(--radius);padding:40px 20px;
  text-align:center;cursor:pointer;transition:all .25s;position:relative;
}
.dropzone:hover,.dropzone.drag{border-color:var(--accent);background:rgba(108,92,231,.06)}
.dropzone.has-file{border-color:var(--green);background:rgba(0,206,201,.06)}
.dropzone svg{width:42px;height:42px;margin:0 auto 10px;display:block;opacity:.5}
.dropzone p{color:var(--text2);font-size:.85rem}
.dropzone .filename{color:var(--green);font-weight:600;font-size:.95rem;margin-top:6px}
.dropzone input{position:absolute;inset:0;opacity:0;cursor:pointer}

.btn{
  display:block;width:100%;padding:14px;margin-top:20px;border:none;
  border-radius:var(--radius);font-size:.95rem;font-weight:700;font-family:inherit;
  cursor:pointer;transition:all .2s;
  background:linear-gradient(135deg,var(--accent),#4834d4);color:#fff;
}
.btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(108,92,231,.35)}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}

/* ─── Pipeline Stages ─── */
.pipeline{display:none}
.pipeline.active{display:block}
.stage{
  display:flex;align-items:center;gap:12px;padding:14px 16px;
  background:var(--surface2);border-radius:8px;margin-bottom:8px;
  border-left:3px solid var(--border);transition:all .3s;
}
.stage.running{border-left-color:var(--accent);animation:pulse 1.5s infinite}
.stage.done{border-left-color:var(--green)}
.stage .dot{
  width:10px;height:10px;border-radius:50%;background:var(--border);flex-shrink:0;
  transition:background .3s;
}
.stage.running .dot{background:var(--accent)}
.stage.done .dot{background:var(--green)}
.stage .label{font-size:.85rem;font-weight:500}
.stage .status{margin-left:auto;font-size:.75rem;color:var(--text2)}

@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}

/* ─── Verdict ─── */
.verdict{display:none}
.verdict.active{display:block}
.verdict-header{
  display:flex;align-items:center;gap:14px;padding:20px;
  border-radius:var(--radius);margin-bottom:16px;
}
.verdict-header.real{background:rgba(0,206,201,.1);border:1px solid rgba(0,206,201,.3)}
.verdict-header.misleading{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3)}
.verdict-header.unknown{background:rgba(116,185,255,.1);border:1px solid rgba(116,185,255,.3)}
.verdict-icon{font-size:2.2rem}
.verdict-title{font-size:1.2rem;font-weight:700}
.verdict-sub{font-size:.8rem;color:var(--text2);margin-top:2px}

.meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.meta-item{background:var(--surface2);border-radius:8px;padding:14px}
.meta-item .k{font-size:.7rem;text-transform:uppercase;color:var(--text2);letter-spacing:.5px;margin-bottom:4px}
.meta-item .v{font-size:1.1rem;font-weight:700}

.risk-bar{height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;margin:4px 0 0}
.risk-fill{height:100%;border-radius:3px;transition:width .8s ease}

.flags{margin-bottom:16px}
.flags h4{font-size:.8rem;text-transform:uppercase;color:var(--text2);margin-bottom:8px;letter-spacing:.5px}
.flag{
  display:inline-block;padding:4px 10px;background:rgba(255,107,107,.1);
  color:var(--red);border-radius:20px;font-size:.75rem;font-weight:500;margin:0 6px 6px 0;
}
.summary-text{font-size:.88rem;line-height:1.6;color:var(--text2);white-space:pre-wrap}

.reset-btn{
  display:block;width:100%;padding:12px;margin-top:16px;background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--radius);color:var(--text);
  font-size:.85rem;font-weight:600;font-family:inherit;cursor:pointer;transition:all .2s;
}
.reset-btn:hover{border-color:var(--accent);background:var(--surface)}
</style>
</head>
<body>
<div class="container">
  <h1>Image Reality Checker</h1>
  <p class="subtitle">Upload an image to verify its authenticity with live evidence</p>

  <!-- Upload Form -->
  <div class="card" id="uploadCard">
    <div class="dropzone" id="dropzone">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
      <p>Drag & drop an image or click to browse</p>
      <p class="filename" id="fileName"></p>
      <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp,image/gif">
    </div>
    <button class="btn" id="submitBtn" disabled>Analyze Image</button>
  </div>

  <!-- Pipeline Stages -->
  <div class="card pipeline" id="pipelineCard">
    <div class="stage" id="s1"><span class="dot"></span><span class="label">Content Extraction</span><span class="status">waiting</span></div>
    <div class="stage" id="s2"><span class="dot"></span><span class="label">Searching Evidence</span><span class="status">waiting</span></div>
    <div class="stage" id="s3"><span class="dot"></span><span class="label">Scraping Sources</span><span class="status">waiting</span></div>
    <div class="stage" id="s4"><span class="dot"></span><span class="label">Reality Verification</span><span class="status">waiting</span></div>
  </div>

  <!-- Verdict -->
  <div class="card verdict" id="verdictCard"></div>
</div>

<script>
const dropzone=document.getElementById('dropzone'),fileInput=document.getElementById('fileInput'),
  fileName=document.getElementById('fileName'),
  submitBtn=document.getElementById('submitBtn'),uploadCard=document.getElementById('uploadCard'),
  pipelineCard=document.getElementById('pipelineCard'),verdictCard=document.getElementById('verdictCard');

let selectedFile=null;

function checkReady(){submitBtn.disabled=!selectedFile}
fileInput.addEventListener('change',e=>{
  selectedFile=e.target.files[0]||null;
  if(selectedFile){fileName.textContent=selectedFile.name;dropzone.classList.add('has-file')}
  else{fileName.textContent='';dropzone.classList.remove('has-file')}
  checkReady();
});

['dragover','dragenter'].forEach(e=>dropzone.addEventListener(e,ev=>{ev.preventDefault();dropzone.classList.add('drag')}));
['dragleave','drop'].forEach(e=>dropzone.addEventListener(e,ev=>{ev.preventDefault();dropzone.classList.remove('drag')}));
dropzone.addEventListener('drop',e=>{
  const f=e.dataTransfer.files[0];
  if(f&&f.type.startsWith('image/')){selectedFile=f;fileName.textContent=f.name;dropzone.classList.add('has-file');checkReady()}
});

function setStage(id,state,txt){
  const el=document.getElementById(id);
  el.className='stage '+state;
  el.querySelector('.status').textContent=txt;
}

const stageMap={'EXTRACTING_CONTENT':'s1','SEARCHING_EVIDENCE':'s2','SCRAPING_SOURCES':'s3','VERIFYING_REALITY':'s4'};

submitBtn.addEventListener('click',async()=>{
  if(!selectedFile)return;
  submitBtn.disabled=true;
  pipelineCard.classList.add('active');
  verdictCard.classList.remove('active');
  ['s1','s2','s3','s4'].forEach(s=>setStage(s,'','waiting'));

  const fd=new FormData();
  fd.append('image',selectedFile);

  try{
    const res=await fetch('/image/stream',{method:'POST',body:fd});
    const reader=res.body.getReader();
    const dec=new TextDecoder();
    let buf='';
    while(true){
      const{done,value}=await reader.read();
      if(done)break;
      buf+=dec.decode(value,{stream:true});
      const lines=buf.split('\n');
      buf=lines.pop();
      let evtType='',evtData='';
      for(const line of lines){
        if(line.startsWith('event: '))evtType=line.slice(7).trim();
        else if(line.startsWith('data: ')){
          evtData=line.slice(6);
          if(evtType&&evtData){
            handleEvent(evtType,JSON.parse(evtData));
            evtType='';evtData='';
          }
        }
      }
    }
  }catch(e){renderError(e.message)}
});

function handleEvent(type,data){
  if(type==='stage'){
    const sid=stageMap[data.stage];
    if(sid){
      Object.values(stageMap).forEach(s=>{
        const el=document.getElementById(s);
        if(el.classList.contains('running'))setStage(s,'done','done');
      });
      setStage(sid,'running',data.text.slice(0,40)+'...');
    }
  }else if(type==='completed'){
    Object.values(stageMap).forEach(s=>setStage(s,'done','done'));
    renderVerdict(data);
  }else if(type==='error'){
    renderError(data.message);
  }
}

function renderVerdict(d){
  const vMap={VERIFIED_REAL:{c:'real',i:'✅',l:'Verified Real'},MISLEADING:{c:'misleading',i:'🚨',l:'Misleading'},UNVERIFIABLE:{c:'unknown',i:'❓',l:'Unverifiable'}};
  const v=vMap[d.verdict]||vMap.UNVERIFIABLE;
  const riskCol=d.riskScore>75?'var(--red)':d.riskScore>50?'var(--orange)':d.riskScore>25?'var(--blue)':'var(--green)';
  const flagsHtml=(d.flags||[]).map(f=>`<span class="flag">${f}</span>`).join('');
  const sourcesHtml=(d.sources||[]).map(s=>`<a href="${s.url}" target="_blank" style="color:var(--accent2);font-size:.82rem;display:block;margin-bottom:4px">${s.title}</a>`).join('');
  const evidenceHtml=(d.evidenceTimeline||[]).map(e=>`<li style="font-size:.82rem;color:var(--text2);margin-bottom:4px">${e}</li>`).join('');
  verdictCard.innerHTML=`
    <div class="verdict-header ${v.c}">
      <span class="verdict-icon">${v.i}</span>
      <div><div class="verdict-title">${v.l}</div><div class="verdict-sub">${d.confidenceLevel} Confidence</div></div>
    </div>
    <div class="meta-grid">
      <div class="meta-item"><div class="k">Risk Score</div><div class="v" style="color:${riskCol}">${d.riskScore}/100</div><div class="risk-bar"><div class="risk-fill" style="width:${d.riskScore}%;background:${riskCol}"></div></div></div>
      <div class="meta-item"><div class="k">Extraction Method</div><div class="v" style="text-transform:uppercase">${d.extractionMethod||'None'}</div></div>
      <div class="meta-item"><div class="k">Status</div><div class="v">${d.verificationStatus||'—'}</div></div>
      <div class="meta-item"><div class="k">Sources Found</div><div class="v">${(d.sources||[]).length}</div></div>
    </div>
    ${flagsHtml?`<div class="flags"><h4>Flags</h4>${flagsHtml}</div>`:''}
    <div class="flags"><h4>Analysis Summary</h4><p class="summary-text">${d.analysisSummary||''}</p></div>
    ${evidenceHtml?`<div class="flags"><h4>Evidence Timeline</h4><ul style="padding-left:16px">${evidenceHtml}</ul></div>`:''}
    ${sourcesHtml?`<div class="flags"><h4>Sources Consulted</h4>${sourcesHtml}</div>`:''}
    <button class="reset-btn" onclick="resetUI()">Analyze Another Image</button>`;
  verdictCard.classList.add('active');
}

function renderError(msg){
  verdictCard.innerHTML=`<div class="verdict-header misleading"><span class="verdict-icon">⚠️</span><div><div class="verdict-title">Error</div><div class="verdict-sub">${msg}</div></div></div><button class="reset-btn" onclick="resetUI()">Try Again</button>`;
  verdictCard.classList.add('active');
}

function resetUI(){
  selectedFile=null;fileInput.value='';fileName.textContent='';
  dropzone.classList.remove('has-file');submitBtn.disabled=true;
  pipelineCard.classList.remove('active');verdictCard.classList.remove('active');
  ['s1','s2','s3','s4'].forEach(s=>setStage(s,'','waiting'));
}
</script>
</body>
</html>
"""
