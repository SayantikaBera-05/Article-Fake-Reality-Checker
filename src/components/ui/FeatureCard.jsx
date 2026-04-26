export default function FeatureCard({ icon, title, description, colorClass, shadowClass }) {
  return (
    <div className="bg-surface-container/40 backdrop-blur-[40px] border border-white/10 rounded-xl p-6 hover:bg-surface-container/60 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-lg ${colorClass}/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_${shadowClass}] transition-all`}>
        <span className={`material-symbols-outlined text-${colorClass.replace('bg-', '')} text-3xl`}>{icon}</span>
      </div>
      <h3 className="font-h3 text-h3 text-on-surface mb-1">{title}</h3>
      <p className="font-body-md text-on-surface-variant text-sm">{description}</p>
    </div>
  );
}
