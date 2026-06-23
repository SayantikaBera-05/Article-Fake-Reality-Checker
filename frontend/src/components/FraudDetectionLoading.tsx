/**
 * FraudDetectionLoading — Server-Driven Stage Display
 * ────────────────────────────────────────────────────
 * Renders the pipeline loading UI based on stages received from the
 * backend SSE stream. NO local timers or setTimeout — the backend
 * is the absolute source of truth for stage progression.
 *
 * Props:
 *   stages: FraudStageEvent[] — array of stages received so far from SSE
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import type { FraudStageEvent } from '../services/api';

interface FraudDetectionLoadingProps {
  stages: FraudStageEvent[];
}

export function FraudDetectionLoading({ stages }: FraudDetectionLoadingProps) {
  return (
    <div className="relative z-20 w-full transition-colors">
      <div className="w-full relative">
        
        {/* Status Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-white/90 backdrop-blur-xl border border-gray-300/50 dark:border-gray-300 p-5 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-[90%] sm:w-full pointer-events-auto shadow-orange-900/20"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-gray-300/50 pb-4">
               <ShieldAlert className="text-orange-500" size={24} />
               <h3 className="text-xl font-semibold text-gray-900 tracking-wide">Security Analysis</h3>
            </div>
            <div className="space-y-5">
              <AnimatePresence>
                {stages.length === 0 && (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-[18px] h-[18px] border-2 border-orange-500 border-t-transparent rounded-full shrink-0"
                    />
                    <p className="text-sm text-gray-600">Connecting to analysis engine...</p>
                  </motion.div>
                )}

                {stages.map((stage, index) => {
                  const isCompleted = index < stages.length - 1;
                  const isActive = index === stages.length - 1;

                  return (
                    <motion.div
                      key={stage.stage}
                      initial={{ opacity: 0, x: -15, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="flex items-start gap-3 overflow-hidden"
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                           <CheckCircle2 className="text-emerald-400" size={18} />
                        ) : isActive ? (
                           <motion.div 
                             animate={{ rotate: 360 }}
                             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                             className="w-[18px] h-[18px] border-2 border-orange-500 border-t-transparent rounded-full"
                           />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-900 font-medium shadow-sm'} transition-colors`}>
                          Stage {stage.sequence}/4 — {stage.stage}: {stage.text}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 font-mono mt-0.5"></span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Skeleton Layout */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-2xl opacity-50 select-none max-w-6xl mx-auto mt-8">
           
           {/* Header Skeleton */}
           <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/60">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gray-100 shimmer"></div>
               <div className="w-48 h-6 rounded bg-gray-100 shimmer"></div>
             </div>
             <div className="w-6 h-6 rounded bg-gray-100 shimmer"></div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
             {/* Col 1: Risk Score Placeholder */}
             <div className="bg-gray-50 rounded-xl p-6 border border-gray-200/60 flex flex-col items-center justify-center min-h-[260px]">
                <div className="h-3 w-24 bg-gray-100 rounded mb-8 shimmer"></div>
                <div className="w-32 h-32 bg-gray-100 rounded-full mb-4 shimmer"></div>
             </div>

             {/* Col 2: Verdict Placeholder */}
             <div className="bg-gray-50 rounded-xl p-6 border border-gray-200/60 flex flex-col items-center justify-center min-h-[260px]">
                <div className="h-3 w-20 bg-gray-100 rounded mb-6 shimmer"></div>
                <div className="w-12 h-12 bg-gray-100 rounded-full mb-6 shimmer"></div>
                <div className="h-6 w-48 bg-gray-100 rounded mb-4 shimmer"></div>
                <div className="h-6 w-32 bg-gray-100 rounded-full shimmer"></div>
             </div>

             {/* Col 3: Indicators Found */}
             <div className="bg-gray-50 rounded-xl p-6 border border-gray-200/60 flex flex-col min-h-[260px]">
                <div className="h-3 w-32 bg-gray-100 rounded mb-6 shimmer"></div>
                <div className="space-y-5 w-full flex-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-4 h-4 rounded-full bg-gray-100 shimmer shrink-0 mt-0.5"></div>
                      <div className="w-full space-y-2">
                        <div className="h-3 w-full bg-gray-100 rounded shimmer"></div>
                        {i % 2 !== 0 && <div className="h-3 w-3/4 bg-gray-100 rounded shimmer"></div>}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           </div>

           {/* Bottom row: Analysis Summary */}
           <div className="bg-gray-50 rounded-xl p-6 border border-gray-200/60 flex flex-col">
              <div className="h-3 w-40 bg-gray-100 rounded mb-6 shimmer"></div>
              <div className="space-y-3 w-full">
                <div className="h-3 w-full bg-gray-100 rounded shimmer"></div>
                <div className="h-3 w-full bg-gray-100 rounded shimmer"></div>
                <div className="h-3 w-11/12 bg-gray-100 rounded shimmer"></div>
                <div className="h-3 w-4/5 bg-gray-100 rounded shimmer"></div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
