export default function HistoryCard({ icon, source, timeAgo, title, description, status, confidence }) {
  let statusClasses = '';
  let statusIcon = '';
  let barColorClass = '';

  if (status === 'FAKE') {
    statusClasses = 'bg-error/20 text-error border-error/50';
    statusIcon = 'warning';
    barColorClass = 'bg-error';
  } else if (status === 'VERIFIED') {
    statusClasses = 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,242,255,0.2)]';
    statusIcon = 'check_circle';
    barColorClass = 'bg-primary';
  } else if (status === 'SUSPICIOUS') {
    statusClasses = 'bg-secondary/20 text-secondary border-secondary/50 shadow-[0_0_10px_rgba(216,185,255,0.15)]';
    statusIcon = 'help';
    barColorClass = 'bg-secondary';
  }

  return (
    <div className="bg-surface-container/40 backdrop-blur-[20px] border border-white/5 rounded-xl p-6 flex flex-col gap-4 hover:bg-surface-container/60 transition-colors duration-300 group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-1 text-outline font-label-caps text-[12px] font-semibold tracking-[0.1em]">
          <span className="material-symbols-outlined text-sm">{icon}</span>
          <span>{source}</span>
        </div>
        <span className="text-outline text-xs">{timeAgo}</span>
      </div>
      <div className="flex-grow">
        <h3 className="font-h3 text-h3 text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="font-body-md text-on-surface-variant line-clamp-3 text-sm">{description}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full border font-label-caps text-[10px] tracking-widest gap-1 ${statusClasses}`}>
            <span className="material-symbols-outlined text-[12px]">{statusIcon}</span> {status}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 w-24">
          <span className="text-xs text-outline font-label-caps tracking-[0.1em]">Confidence</span>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className={`h-full ${barColorClass}`} style={{ width: `${confidence}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
