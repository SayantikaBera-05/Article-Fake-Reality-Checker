export default function StepCard({ icon, title, description, isPulse, delayClass }) {
  return (
    <div className="flex flex-col items-center text-center max-w-[250px]">
      <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline/30 flex items-center justify-center mb-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative">
        <span className={`material-symbols-outlined text-3xl ${isPulse ? 'text-secondary-fixed-dim animate-pulse' : 'text-primary-fixed-dim'}`}>
          {icon}
        </span>
        {isPulse && (
          <div className="absolute inset-0 rounded-full border border-secondary-fixed-dim/30 animate-ping opacity-20"></div>
        )}
      </div>
      <h3 className="font-h3 text-lg text-on-surface mb-1">{title}</h3>
      <p className="font-body-md text-on-surface-variant text-sm">{description}</p>
    </div>
  );
}
