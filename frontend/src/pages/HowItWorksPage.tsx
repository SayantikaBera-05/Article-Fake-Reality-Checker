import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { Globe, Search, BookOpen, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans transition-colors">
      <Navbar />
      
      <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-3xl mx-auto">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-slate-200"
        >
          {/* Header */}
          <header className="mb-12 border-b border-slate-100 pb-10">
            <div className="flex items-center gap-3 text-primary font-medium mb-4 justify-center md:justify-start">
              <HelpCircle size={20} />
              <span>Behind the Scenes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 text-center md:text-left">
              How We Spot Fake News (in simple terms)
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  V
                </div>
                <span className="font-medium text-slate-700">Verifi Team</span>
              </div>
              <span className="hidden md:inline">•</span>
              <time>May 2026</time>
              <span className="hidden md:inline">•</span>
              <span>5 min read</span>
            </div>
          </header>

          {/* Simple Explanation Content */}
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="lead text-xl text-slate-600 mb-10">
              Have you ever seen a crazy headline on social media and wondered, <em>"Is this actually true?"</em> Verifi was built to answer that question for you in a matter of seconds. But how does it work? Let's break it down without the technical jargon.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">It's like hiring a private investigator.</h2>
            <p>
              When you paste a link or type a claim into Verifi, we don't just "guess" if it's true. Instead, our AI acts like a team of three highly trained journalists working together at lightning speed. We call them the <strong>Scout</strong>, the <strong>Reader</strong>, and the <strong>Judge</strong>.
            </p>

            {/* Visual Steps */}
            <div className="space-y-8 my-12 not-prose">
              
              {/* Step 1 */}
              <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Search size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">1. The Scout (Finding Clues)</h3>
                  <p className="text-slate-600">
                    The moment you hit "Verify", the Scout immediately starts searching Google. It looks for the most recent, reliable news articles, fact-check reports, and official documents related to your claim. It ignores the noise and grabs only the most relevant links.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <BookOpen size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">2. The Reader (Speed Reading)</h3>
                  <p className="text-slate-600">
                    Next, the Reader takes over. It visits all the websites the Scout found. It ignores annoying pop-up ads, videos, and banners, and reads the actual text of the articles. It processes thousands of words in a fraction of a second, looking for hard facts.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                    <ShieldCheck size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">3. The Judge (The Verdict)</h3>
                  <p className="text-slate-600">
                    Finally, the Judge steps in. It takes your original claim and compares it against all the evidence the Reader gathered. Does the evidence support what you read, or does it contradict it? The Judge then gives you a clear final answer: <strong>True, False, or Unverified</strong>, along with a detailed explanation of why.
                  </p>
                </div>
              </div>

            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Why not just ask ChatGPT?</h2>
            <p>
              Standard AI chatbots are great at chatting, but they have a fatal flaw: they aren't connected to the live internet. If a fake news story broke 10 minutes ago, a standard AI won't know about it and might just make up a convincing lie (a "hallucination").
            </p>
            <p>
              By forcing our AI to act as a Scout and Reader <em>first</em>, we ensure it only makes judgments based on cold, hard, real-time facts pulled directly from the live internet.
            </p>

            <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-center not-prose">
              <Globe className="text-cyan-400 mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-bold text-white mb-4">Ready to try it yourself?</h3>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">
                Paste a suspicious headline, rumor, or article link into our engine and let the team go to work.
              </p>
              <Link 
                to="/verify" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-black font-bold hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                Verify a Claim Now
              </Link>
            </div>

          </div>
        </motion.article>
      </div>
    </div>
  );
}
