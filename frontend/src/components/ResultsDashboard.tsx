
import { motion } from 'framer-motion';
import { AlertTriangle, Globe } from 'lucide-react';

export function ResultsDashboard() {
  const claim = "The Earth's core has completely stopped spinning and is now rotating in the opposite direction.";
  const sources = [
    { title: "Nature Geoscience Study", snippet: "States the inner core rotation has slowed relative to the mantle, not stopped." },
    { title: "NASA Earth Observatory", snippet: "Clarifies magnetic field reversal is unrelated to physical core rotation." },
    { title: "Seismological Data 2023", snippet: "Shows continued but variable differential rotation." }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-gray-100 relative z-20 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 lg:px-12"
      >
        <div className="bg-white dark:bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-200 dark:border-gray-200/50 shadow-2xl transition-colors">
          <div className="p-8 space-y-8">
            <div className="bg-slate-50 dark:bg-white/50 rounded-2xl p-6 border border-slate-200 dark:border-gray-200 transition-colors">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-3">Extracted Claim</h3>
              <p className="text-lg text-slate-900 dark:text-gray-900 font-medium transition-colors">"{claim}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Col 1: Veracity Label */}
            <div className="bg-white dark:bg-gray-100/20 rounded-3xl p-8 border border-slate-200 dark:border-gray-200 flex flex-col items-center justify-center text-center transition-colors">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={40} className="text-orange-500" />
              </div>
              <h4 className="text-gray-500 dark:text-gray-600 font-medium mb-2 uppercase tracking-wide text-sm">Final Verdict</h4>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
                Mostly False
              </div>
              <p className="text-slate-600 dark:text-gray-500 text-sm">
                The claim exaggerates a real scientific study about differential rotation rates.
              </p>
            </div>

            {/* Col 2: Confidence Meter */}
            <div className="bg-white dark:bg-gray-100/20 rounded-3xl p-8 border border-slate-200 dark:border-gray-200 flex flex-col items-center transition-colors">
              <h4 className="text-gray-500 dark:text-gray-600 font-medium mb-6 uppercase tracking-wide text-sm">Confidence Score</h4>

              <div className="relative w-40 h-40 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#00F0FF"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                    whileInView={{ strokeDashoffset: 251.2 * (1 - 0.87) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-4xl font-bold text-slate-900 dark:text-gray-900">87%</span>
                </div>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-white/50 rounded-xl p-4 flex justify-between items-center transition-colors">
                <span className="text-gray-500 dark:text-gray-600 text-sm">Sources Checked</span>
                <span className="font-mono text-orange-500 font-medium">1,248</span>
              </div>
            </div>

            {/* Col 3: Evidence List */}
            <div className="bg-white dark:bg-gray-100/20 rounded-3xl p-8 border border-slate-200 dark:border-gray-200 flex flex-col h-full max-h-[400px] transition-colors">
              <h4 className="text-gray-500 dark:text-gray-600 font-medium mb-6 uppercase tracking-wide text-sm">Key Evidence</h4>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {sources.map((source, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/30 border border-transparent hover:border-slate-200 dark:hover:border-gray-200 transition-all cursor-pointer">
                    <div className="mt-1 text-gray-600 dark:text-gray-500">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-gray-900 font-medium mb-1 transition-colors">{source.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-600">{source.snippet}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
