import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FileText, Brain, Search, ShieldCheck } from 'lucide-react';

export function ArchitectureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: <FileText size={32} className="text-primary mb-4" />,
      title: "Multimodal Processing",
      desc: "Users submit raw text, article URLs, or images. The MERN API Gateway processes and normalizes the payload.",
    },
    {
      icon: <Brain size={32} className="text-primary mb-4" />,
      title: "Claim Extraction",
      desc: "Our Analyst Agent powered by Openrouter instantly analyzes the input, utilizing evidence retrieved by the Scout to extract the core factual claim being made.",
    },
    {
      icon: <Search size={32} className="text-primary mb-4" />,
      title: "Evidence Retrieval",
      desc: "The AI engine generates targeted search queries to scour the web, retrieving highly relevant real-time news snippets and source documents.",
    },
    {
      icon: <ShieldCheck size={32} className="text-primary mb-4" />,
      title: "Veracity Scoring",
      desc: "The Llama 3 model evaluates the extracted claim against the retrieved evidence, mapping contradictions to generate a strict JSON response containing a Veracity Label and Confidence Score.",
    }
  ];

  return (
    <section className="py-32 bg-slate-50 dark:bg-gray-100 relative z-20 overflow-hidden transition-colors">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.3] mix-blend-overlay pointer-events-none z-0"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-slate-900 dark:text-gray-900 mb-20 transition-colors"
        >
          The Verifi Pipeline
        </motion.h2>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent z-0 transition-colors"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white dark:bg-surface border border-slate-200 dark:border-gray-200 rounded-2xl p-8 relative z-10 hover:border-slate-300 dark:hover:border-gray-300 transition-colors shadow-xl"
            >
              <div className="bg-orange-50 w-16 h-16 rounded-xl flex items-center justify-center border border-orange-100 mb-6 shadow-inner mx-auto lg:mx-0 transition-colors">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 text-center lg:text-left transition-colors">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm text-center lg:text-left transition-colors">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
