export default function InputGroup({ id, label, type, placeholder, icon, rightElement }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-on-surface-variant uppercase" htmlFor={id}>
          {label}
        </label>
        {rightElement}
      </div>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-2 text-outline-variant text-[20px]">
          {icon}
        </span>
        <input 
          id={id}
          type={type}
          placeholder={placeholder}
          className="w-full bg-surface-container-highest/30 border border-outline-variant rounded-md py-2 pl-10 pr-2 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary-container focus:bg-surface-container-highest/50 transition-all font-body-md"
        />
      </div>
    </div>
  );
}
