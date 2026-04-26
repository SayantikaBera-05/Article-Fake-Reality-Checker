export default function StatCard({ icon, label, value, description, colorClass }) {
  return (
    <div className="bg-surface-container-low/50 p-4 rounded-lg border border-outline-variant/10">
      <div className={`flex items-center gap-2 mb-1 ${colorClass}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span className="font-label-caps text-[12px] font-semibold tracking-[0.1em]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-on-surface mb-1">{value}</div>
      <p className="text-sm text-on-surface-variant">{description}</p>
    </div>
  );
}
