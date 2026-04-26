export default function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex border-b border-white/10 bg-surface-container-highest/20">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-6 font-label-caps text-[12px] font-semibold tracking-[0.1em] transition-all duration-300 border-b-2 ${
              isActive
                ? 'text-primary border-primary bg-primary-container/5 shadow-[inset_0_-2px_10px_rgba(0,242,255,0.1)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-transparent'
            }`}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
