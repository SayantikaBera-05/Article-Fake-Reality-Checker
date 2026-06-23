import { Navbar } from '../components/Navbar';
import { BookOpen, Code, Database, Server, Shield, Smartphone, ArrowRight, Activity, Zap, ShieldCheck, Globe, BrainCircuit, Search, FileText, Cpu, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export function DocumentationPage() {
  
  // Reusable component for glowing data packets (from HowItWorks)
  const DataPacket = ({ delay, duration = 3, yOffset = 0 }: { delay: number, duration?: number, yOffset?: number }) => (
    <motion.div 
      initial={{ left: "0%", opacity: 0 }}
      animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
      transition={{ repeat: Infinity, duration, delay, ease: "linear" }}
      className="absolute h-1.5 w-8 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] z-20"
      style={{ top: `calc(50% - 3px + ${yOffset}px)` }}
    />
  );

  const VerticalDataPacket = ({ delay, duration = 2, reverse = false, xOffset = 0 }: { delay: number, duration?: number, reverse?: boolean, xOffset?: number }) => (
    <motion.div 
      initial={{ top: reverse ? "100%" : "0%", opacity: 0 }}
      animate={{ top: reverse ? "0%" : "100%", opacity: [0, 1, 1, 0] }}
      transition={{ repeat: Infinity, duration, delay, ease: "linear" }}
      className="absolute w-1.5 h-8 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] z-20"
      style={{ left: `calc(50% - 3px + ${xOffset}px)` }}
    />
  );

  const techStack = [
    {
      title: 'Frontend Client',
      icon: <Smartphone className="text-primary" size={24} />,
      items: [
        { name: 'React 19 with TypeScript', url: 'https://react.dev/' },
        { name: 'Vite for fast bundling', url: 'https://vitejs.dev/' },
        { name: 'Tailwind CSS for typography and layout', url: 'https://tailwindcss.com/' },
        { name: 'Framer Motion for fluid animations', url: 'https://www.framer.com/motion/' },
      ],
    },
    {
      title: 'API Gateway (Node.js)',
      icon: <Server className="text-blue-500" size={24} />,
      items: [
        { name: 'Express.js API Server', url: 'https://expressjs.com/' },
        { name: 'JSON Web Tokens (JWT) & Passport', url: 'https://www.passportjs.org/' },
        { name: 'Google OAuth 2.0 Integration', url: 'https://developers.google.com/identity/protocols/oauth2' },
        { name: 'Zod for Request Validation', url: 'https://zod.dev/' },
      ],
    },
    {
      title: 'Fraud Detection Engine',
      icon: <Shield className="text-red-500" size={24} />,
      items: [
        { name: 'Python FastAPI microservice', url: 'https://fastapi.tiangolo.com/' },
        { name: 'Uvicorn ASGI server', url: 'https://www.uvicorn.org/' },
        { name: 'Pydantic for Data Validation', url: 'https://docs.pydantic.dev/' },
        { name: 'Agentic AI Pipeline', url: 'https://en.wikipedia.org/wiki/Intelligent_agent' },
      ],
    },
    {
      title: 'Database & Infrastructure',
      icon: <Database className="text-green-500" size={24} />,
      items: [
        { name: 'MongoDB (Mongoose ODM)', url: 'https://mongoosejs.com/' },
        { name: 'RESTful API Architecture', url: 'https://restfulapi.net/' },
      ],
    },
  ];

  const apisUsed = [
    {
      name: 'OpenRouter',
      url: 'https://openrouter.ai/',
      description: 'Powers our lightning-fast Llama 3 models. OpenRouter allows us to run complex reasoning tasks across our Agentic Pipeline in milliseconds rather than seconds.',
      icon: <Zap className="text-yellow-500" size={24} />
    },
    {
      name: 'Serper.dev',
      url: 'https://serper.dev/',
      description: 'The Scout agent uses Serper.dev as its eyes on the internet. It provides a real-time, high-fidelity Google Search API allowing us to instantly pull relevant news articles and source documents.',
      icon: <SearchIcon className="text-blue-400" size={24} />
    },
    {
      name: 'Jina AI (Reader)',
      url: 'https://jina.ai/reader',
      description: 'When the Scout finds a relevant URL, Jina AI is used to securely scrape and parse the article into clean, LLM-friendly markdown, removing ads and boilerplate HTML.',
      icon: <FileTextIcon className="text-emerald-500" size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans transition-colors">
      <Navbar />
      
      {/* Changed to full width max-w-[1400px] instead of max-w-4xl */}
      <div className="pt-32 pb-24 px-4 sm:px-6 w-full max-w-[1400px] mx-auto">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-slate-200 w-full"
        >
          {/* Header */}
          <header className="mb-12 border-b border-slate-100 pb-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-primary font-medium mb-4">
              <BookOpen size={20} />
              <span>Developer Journal & Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Building Verifi*: The Technical Blueprint
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                  <Cpu size={16} />
                </div>
                <span className="font-medium text-slate-700">Verifi Systems Engineering</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <time>May 2026</time>
              <span className="hidden sm:inline">•</span>
              <span>15 min read</span>
            </div>
          </header>

          {/* Intro Content */}
          <div className="prose prose-slate prose-lg mx-auto max-w-4xl mb-16">
            <p className="lead text-xl text-slate-600 mb-10">
              Welcome to the official technical documentation for Verifi*. This post outlines the architectural decisions, technology stack, and the complex agentic data flow that powers our real-time fraud detection engine.
            </p>
          </div>

          {/* Complex Architecture Animation Flow (Moved from HowItWorks) */}
          <div className="mb-20 overflow-x-auto no-scrollbar pb-8 w-full -mx-2 px-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-400 mb-6 uppercase tracking-widest text-center text-xs sm:text-sm">Network Topology & Data Flow</h2>
            <p className="text-center text-slate-400 text-xs mb-4 sm:hidden">← Scroll horizontally to explore →</p>
            
            <div className="relative min-w-[1000px] w-full mx-auto p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-200">
              {/* Background Grid */}
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] rounded-[2.5rem]"></div>
              
              <div className="relative z-10">
                
                {/* --- LAYER 1: CLIENT --- */}
                <div className="flex justify-center mb-16 relative">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl w-48 relative z-30"
                  >
                    <Globe className="text-cyan-500 mb-2" size={32} />
                    <span className="text-slate-900 font-bold text-sm">React 19 SPA</span>
                    <span className="text-slate-500 text-xs mt-1">Client Interface</span>
                  </motion.div>
                  
                  {/* Vertical line to API Gateway */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-16 bg-slate-200 z-10">
                    <VerticalDataPacket delay={0} duration={1.5} />
                    <VerticalDataPacket delay={0.75} duration={1.5} />
                  </div>
                </div>

                {/* --- LAYER 2: API GATEWAY & DATABASE --- */}
                <div className="flex justify-between items-center mb-16 relative z-30 max-w-4xl mx-auto">
                  
                  {/* Auth / Security Middleware */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center bg-slate-50 border border-emerald-200 p-4 rounded-2xl w-40"
                  >
                    <ShieldCheck className="text-emerald-500 mb-2" size={28} />
                    <span className="text-slate-900 font-bold text-sm">Passport.js</span>
                    <span className="text-slate-500 text-xs mt-1">JWT / OAuth 2.0</span>
                  </motion.div>

                  {/* Horizontal connect 1 */}
                  <div className="flex-1 h-1 bg-slate-200 mx-4 relative overflow-hidden">
                    <DataPacket delay={0} duration={2} />
                  </div>

                  {/* Core Node.js Gateway */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center bg-white border-2 border-blue-400 p-6 rounded-2xl w-56 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative z-30"
                  >
                    <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                      Express
                    </div>
                    <Server className="text-blue-500 mb-3" size={36} />
                    <span className="text-slate-900 font-bold">API Gateway</span>
                    <span className="text-slate-500 text-xs mt-1 text-center">Rate Limiting • Zod Validations<br/>SSE Streams</span>
                  </motion.div>

                  {/* Horizontal connect 2 */}
                  <div className="flex-1 h-1 bg-slate-200 mx-4 relative overflow-hidden">
                    <DataPacket delay={0.5} duration={2} />
                  </div>

                  {/* MongoDB */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center bg-slate-50 border border-green-200 p-4 rounded-2xl w-40"
                  >
                    <Database className="text-green-500 mb-2" size={28} />
                    <span className="text-slate-900 font-bold text-sm">MongoDB</span>
                    <span className="text-slate-500 text-xs mt-1">Mongoose ODM</span>
                  </motion.div>

                  {/* Vertical lines from Node.js Gateway to Python Engine */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-20 bg-slate-200 z-10">
                    {/* Down stream (Request) */}
                    <VerticalDataPacket delay={0.2} duration={1.2} xOffset={-4} />
                    {/* Up stream (SSE stream) */}
                    <VerticalDataPacket delay={0.8} duration={1.2} reverse={true} xOffset={4} />
                  </div>
                </div>

                {/* --- LAYER 3: PYTHON FRAUD ENGINE & AGENTS --- */}
                <div className="relative border border-amber-200 bg-amber-50/50 rounded-3xl p-8 pt-12 mt-20 max-w-5xl mx-auto">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                    Python FastAPI Engine
                  </div>

                  <div className="flex justify-between items-start gap-6 relative z-30">
                    
                    {/* Agent 1: Scout */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-2xl flex-1 relative shadow-sm"
                    >
                      <Search className="text-indigo-500 mb-3" size={28} />
                      <span className="text-slate-900 font-bold text-sm">Scout Agent</span>
                      <span className="text-slate-500 text-xs mt-2 text-center border-t border-slate-100 pt-2 w-full">Generates Dorks</span>
                      
                      {/* Sub-node: Serper */}
                      <div className="mt-6 flex flex-col items-center w-full">
                        <div className="w-0.5 h-6 bg-slate-200 mb-2 relative overflow-hidden">
                          <VerticalDataPacket delay={0} duration={1} />
                        </div>
                        <div className="bg-indigo-50 text-indigo-600 text-[10px] uppercase font-bold py-1 px-3 rounded-md w-full text-center border border-indigo-100">
                          Serper.dev API
                        </div>
                      </div>
                    </motion.div>

                    {/* Agent 2: Reader */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-2xl flex-1 relative mt-8 shadow-sm"
                    >
                      <FileText className="text-emerald-500 mb-3" size={28} />
                      <span className="text-slate-900 font-bold text-sm">Reader Agent</span>
                      <span className="text-slate-500 text-xs mt-2 text-center border-t border-slate-100 pt-2 w-full">HTML Extraction</span>
                      
                      {/* Sub-node: Jina */}
                      <div className="mt-6 flex flex-col items-center w-full">
                        <div className="w-0.5 h-6 bg-slate-200 mb-2 relative overflow-hidden">
                          <VerticalDataPacket delay={0.3} duration={1} />
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 text-[10px] uppercase font-bold py-1 px-3 rounded-md w-full text-center border border-emerald-100">
                          Jina AI Reader
                        </div>
                      </div>
                    </motion.div>

                    {/* Agent 3: Analyst */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex flex-col items-center bg-white border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.1)] p-5 rounded-2xl flex-1 relative"
                    >
                      <BrainCircuit className="text-amber-500 mb-3" size={32} />
                      <span className="text-slate-900 font-bold text-sm">Analyst Agent</span>
                      <span className="text-slate-500 text-xs mt-2 text-center border-t border-slate-100 pt-2 w-full">Veracity Scoring</span>
                      
                      {/* Sub-node: OpenRouter */}
                      <div className="mt-6 flex flex-col items-center w-full">
                        <div className="w-0.5 h-6 bg-slate-200 mb-2 relative overflow-hidden">
                          <VerticalDataPacket delay={0.1} duration={0.8} />
                          <VerticalDataPacket delay={0.5} duration={0.8} reverse={true} />
                        </div>
                        <div className="bg-amber-50 text-amber-700 text-[10px] uppercase font-bold py-1.5 px-3 rounded-md w-full flex items-center justify-center gap-2 border border-amber-200">
                          <Zap size={12} className="text-yellow-500" />
                          OpenRouter Llama 3
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Deep Dive Content */}
          <div className="prose prose-slate prose-lg max-w-4xl mx-auto">
            
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">1. The Philosophy & Architecture</h2>
            <p>
              When building an automated fact-checking system, latency and accuracy are directly at odds. Standard LLM approaches either hallucinate facts or take too long to retrieve live data. To solve this, we split the application into a <strong>dual-backend microservice architecture</strong>.
            </p>
            <p>
              We handle user management and session states via a lightweight Node.js API Gateway, while the heavy lifting—web scraping, reasoning, and semantic search—is delegated to a dedicated Python FastAPI engine.
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Server size={24} /></div>
              The Express.js API Gateway
            </h3>
            <p>
              The Node.js Gateway serves as the centralized orchestrator and security perimeter. All requests from the React client first hit this layer. Its primary responsibilities include:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-12">
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong>Auth & Session Management:</strong> Using Passport.js and JWTs, it validates user sessions, handles Google OAuth 2.0 handshakes, and guards authenticated endpoints.
              </li>
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong>Request Validation:</strong> Incoming JSON payloads are strictly validated using <code>Zod</code> schemas before processing to prevent malformed data injections.
              </li>
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong>SSE Streaming:</strong> It establishes a Server-Sent Events connection with the client, piping the real-time reasoning stream generated by the Python engine directly to the UI.
              </li>
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong>Data Persistence:</strong> Interacts with the MongoDB cluster via Mongoose to store user verification histories securely.
              </li>
            </ul>

            <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-6 flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><BrainCircuit size={24} /></div>
              The Agentic Python Engine
            </h3>
            <p>
              When a verification request passes the Gateway, it is forwarded to the <strong>FastAPI Python Engine</strong>. Instead of relying on a single static LLM prompt, this engine deploys a specialized <em>Agentic Pipeline</em> that mimics a human researcher's workflow.
            </p>
            
            <div className="mt-8 space-y-6 not-prose mb-12">
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-100 text-indigo-700 p-3 rounded-full shrink-0 mt-1"><Search size={20} /></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 m-0 mb-1">1. The Scout Agent</h4>
                  <p className="text-slate-600 m-0">Analyzes the initial claim to generate highly optimized Google Search queries ("dorks"). It interfaces with the <strong>Serper.dev API</strong> to retrieve the top 5-10 most relevant, up-to-the-minute news articles or source documents.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full shrink-0 mt-1"><FileText size={20} /></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 m-0 mb-1">2. The Reader Agent</h4>
                  <p className="text-slate-600 m-0">Takes the URLs discovered by the Scout and utilizes <strong>Jina AI</strong> to bypass ad-blockers and scrape the raw HTML. It parses the content into clean, token-efficient Markdown, stripping away navigation bars, footers, and advertisements.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-amber-100 text-amber-700 p-3 rounded-full shrink-0 mt-1"><BrainCircuit size={20} /></div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 m-0 mb-1">3. The Analyst Agent</h4>
                  <p className="text-slate-600 m-0">This is the core reasoning engine. Powered by <strong>OpenRouter (running Llama 3)</strong>, the Analyst cross-references the user's original claim against the thousands of words of Markdown evidence compiled by the Reader. It streams its logical deduction back to the user in real-time before issuing a final JSON payload containing the Veracity Score and Confidence Level.</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
              <Code className="text-indigo-500" /> 
              2. Core Technology Stack
            </h2>
            <p className="mb-8">
              We chose an ecosystem that prioritizes type safety, speed, and modularity. Below is the breakdown of the primary tools running in production:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose mb-12">
              {techStack.map((stack, index) => (
                <div key={index} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                      {stack.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{stack.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {stack.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                        <ArrowRight size={16} className="text-primary mt-0.5 shrink-0" />
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex items-center gap-1 group"
                        >
                          {item.name}
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
              <Activity className="text-rose-500" />
              3. Third-Party API Integrations
            </h2>
            <p className="mb-8">
              Verifi is only as good as the evidence it can retrieve. We rely on three critical third-party APIs to power the Agentic Pipeline within our Python Engine:
            </p>

            <div className="space-y-6 not-prose mb-12">
              {apisUsed.map((api, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 items-start p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                    {api.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      {api.name}
                      <a 
                        href={api.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-cyan-600 transition-colors inline-flex"
                        title={`Visit ${api.name} website`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                      {api.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">4. Moving Forward</h2>
            <p>
              Our current architecture processes claims in under 3 seconds. Future iterations will explore caching mechanisms via Redis and persistent conversational history with standard SQL constraints.
            </p>
          </div>
        </motion.article>
      </div>
    </div>
  );
}

// Inline missing lucide icons for the custom array
function SearchIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
}
function FileTextIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
}
