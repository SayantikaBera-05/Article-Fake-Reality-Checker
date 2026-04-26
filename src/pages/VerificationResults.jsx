import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import SourceCard from '../components/ui/SourceCard';

export default function VerificationResults() {
  return (
    <main className="flex-grow pt-24 pb-12 px-8 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Header / Meta Context */}
      <header className="flex flex-col gap-2 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-4 text-on-surface-variant font-label-caps text-[12px] font-semibold tracking-[0.1em]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span> SCAN ID: #TL-889-X
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span> COMPLETED: 2 MINS AGO
          </span>
        </div>
        <h1 className="font-h2 text-h2 text-on-surface">Target Analysis: &quot;The Secret Energy Crisis They Aren&apos;t Telling You About&quot;</h1>
        <Link to="#" className="text-primary-fixed-dim hover:text-primary transition-colors flex items-center gap-1 w-max text-sm">
          <span className="material-symbols-outlined text-[16px]">link</span> Source URL
        </Link>
      </header>

      {/* Bento Grid: Top Section (Verdict & Summary) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* THE VERDICT CARD */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-xl bg-error-container/20 border border-error/30 backdrop-blur-[20px] p-6 flex flex-col justify-between min-h-[380px]">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-error/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-error/80 to-transparent"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[12px] font-semibold tracking-[0.2em] text-error">FINAL VERDICT</span>
              <span className="material-symbols-outlined text-error text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h2 className="font-h1 text-h1 text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.4)]">DECEPTIVE</h2>
            <p className="font-body-md text-on-error-container/80">
              High probability of intentional manipulation. Content utilizes logical fallacies, unverified claims, and emotional manipulation tactics.
            </p>
          </div>
          
          <div className="relative z-10 space-y-4 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between font-label-caps text-[12px] font-semibold tracking-[0.1em]">
                <span className="text-on-surface-variant">AI CONFIDENCE INDEX</span>
                <span className="text-error font-bold">94%</span>
              </div>
              {/* High-tech Progress Bar */}
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="h-full bg-error w-[94%] shadow-[0_0_10px_rgba(255,180,171,0.8)] relative">
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px]"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-error/10 hover:bg-error/20 border border-error/50 text-error font-label-caps text-[12px] font-semibold tracking-[0.1em] py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined text-[18px]">download</span> REPORT
              </button>
              <button className="flex-1 bg-error text-on-error hover:bg-error/90 font-label-caps text-[12px] font-semibold tracking-[0.1em] py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,180,171,0.2)]">
                <span className="material-symbols-outlined text-[18px]">share</span> SHARE ALERT
              </button>
            </div>
          </div>
        </div>

        {/* EXPLANATION SUMMARY CARD */}
        <div className="lg:col-span-7 bg-surface-container/40 border border-outline-variant/30 rounded-xl backdrop-blur-[20px] p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            <h3 className="font-h3 text-h3 text-on-surface">Analysis Breakdown</h3>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
            Our neural models detected multiple instances of structural deception. The article conflates unrelated scientific studies to manufacture a false narrative about an impending global energy shutdown.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
            <StatCard 
              icon="psychology_alt"
              label="EMOTIONAL LOAD"
              value="Critical"
              description="Uses fear-inducing lexicon primarily targeting economic anxiety."
              colorClass="text-error"
            />
            <StatCard 
              icon="account_tree"
              label="SOURCE TRACEABILITY"
              value="0 Verified Links"
              description="Citations route to circular, self-referential blog networks."
              colorClass="text-secondary-fixed-dim"
            />
            <StatCard 
              icon="history"
              label="NARRATIVE RECYCLING"
              value="Matches 2019 Hoax"
              description="Text structure correlates 88% with a debunked campaign."
              colorClass="text-primary-fixed-dim"
            />
            <StatCard 
              icon="imagesmode"
              label="MEDIA INTEGRITY"
              value="Altered Visuals"
              description="Header image shows traces of generative AI artifacts."
              colorClass="text-outline"
            />
          </div>
        </div>
      </section>

      {/* Bento Grid: Bottom Section (Evidence & Sources) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HIGHLIGHTED SENTENCES CARD */}
        <div className="lg:col-span-8 bg-surface-container/40 border border-outline-variant/30 rounded-xl backdrop-blur-[20px] p-6">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>find_in_page</span>
            <h3 className="font-h3 text-h3 text-on-surface">Suspicious Fragments Detected</h3>
          </div>
          
          <div className="space-y-4">
            {/* Fragment 1 */}
            <div className="bg-surface-container-low rounded-lg p-4 border-l-2 border-error">
              <div className="mb-2">
                <span className="bg-error/10 text-error text-[10px] px-2 py-1 rounded font-label-caps uppercase font-semibold tracking-[0.1em] border border-error/20 inline-block mb-2">
                  Fabricated Quote
                </span>
                <p className="font-body-md text-on-surface italic">
                  &quot;...Dr. Aris Thorne, leading researcher at the Global Energy Institute, confirmed yesterday that governments are intentionally suppressing the new quantum core technology.&quot;
                </p>
              </div>
              <div className="bg-surface-container bg-opacity-50 p-2 rounded border border-outline-variant/20 mt-2 flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[20px] mt-1">robot</span>
                <div>
                  <h4 className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-primary-fixed-dim mb-1">AI CORRECTION</h4>
                  <p className="text-sm text-on-surface-variant">Neither &quot;Dr. Aris Thorne&quot; nor the &quot;Global Energy Institute&quot; exist in any verified academic or corporate registry.</p>
                </div>
              </div>
            </div>

            {/* Fragment 2 */}
            <div className="bg-surface-container-low rounded-lg p-4 border-l-2 border-secondary-fixed-dim">
              <div className="mb-2">
                <span className="bg-secondary/10 text-secondary-fixed-dim text-[10px] px-2 py-1 rounded font-label-caps uppercase font-semibold tracking-[0.1em] border border-secondary/20 inline-block mb-2">
                  Misleading Context
                </span>
                <p className="font-body-md text-on-surface italic">
                  &quot;The recent grid failures in Texas are just the beta test for this new control system, as shown in the leaked FEMA documents.&quot;
                </p>
              </div>
              <div className="bg-surface-container bg-opacity-50 p-2 rounded border border-outline-variant/20 mt-2 flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[20px] mt-1">robot</span>
                <div>
                  <h4 className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-primary-fixed-dim mb-1">AI CORRECTION</h4>
                  <p className="text-sm text-on-surface-variant">Texas grid failures were attributed to extreme weather and infrastructure vulnerabilities. The &quot;leaked FEMA documents&quot; mentioned link to an unrelated 2012 hurricane preparedness manual.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRUSTED SOURCES CARD */}
        <div className="lg:col-span-4 bg-surface-container/40 border border-outline-variant/30 rounded-xl backdrop-blur-[20px] p-6">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <h3 className="font-h3 text-h3 text-on-surface">Verified Sources</h3>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">Compare this claim against established reporting from high-trust index publishers.</p>
          
          <div className="space-y-2 flex-col flex">
            <SourceCard 
              icon="language"
              title="AP News Fact Check"
              description="Texas grid failures linked to weather, not intentional sabotage or &quot;quantum&quot; testing."
              href="#"
            />
            <SourceCard 
              icon="newspaper"
              title="Reuters Truth Index"
              description="Debunking the &quot;Global Energy Institute&quot; hoax circulating on social media."
              href="#"
            />
            <SourceCard 
              icon="science"
              title="MIT Technology Review"
              description="The current state of quantum energy research and why commercial cores remain decades away."
              href="#"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
