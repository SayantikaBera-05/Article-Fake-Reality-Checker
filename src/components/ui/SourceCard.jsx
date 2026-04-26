export default function SourceCard({ icon, title, description, href }) {
  return (
    <a 
      href={href}
      className="group p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-highest border border-outline-variant/10 hover:border-primary-fixed-dim/50 transition-all flex items-start gap-4"
    >
      <div className="bg-surface-container w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant/30 group-hover:border-primary-fixed-dim/50 flex-shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-fixed-dim text-[20px]">
          {icon}
        </span>
      </div>
      <div>
        <h4 className="font-body-md text-on-surface font-medium group-hover:text-primary-fixed-dim transition-colors line-clamp-1">
          {title}
        </h4>
        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
          {description}
        </p>
      </div>
    </a>
  );
}
