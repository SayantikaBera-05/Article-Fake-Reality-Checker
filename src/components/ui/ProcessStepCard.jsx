export default function ProcessStepCard({ number, title, description, colorClass }) {
  const colorMap = {
    'primary-container': {
      border: 'border-primary-container',
      from: 'from-primary-container/5',
      bg: 'bg-primary-container/20',
      text: 'text-primary-container'
    },
    'secondary': {
      border: 'border-secondary',
      from: 'from-secondary/5',
      bg: 'bg-secondary/20',
      text: 'text-secondary'
    },
    'primary': {
      border: 'border-primary',
      from: 'from-primary/5',
      bg: 'bg-primary/20',
      text: 'text-primary'
    }
  };

  const colors = colorMap[colorClass] || colorMap['primary'];

  return (
    <div className={`bg-surface-container/40 backdrop-blur-[20px] rounded-lg p-4 border-t-2 ${colors.border} relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${colors.from} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-h3 text-lg`}>
          {number}
        </div>
        <h3 className="font-h3 text-h3 text-on-surface">{title}</h3>
      </div>
      <p className="font-body-md text-on-surface-variant relative z-10 text-sm">
        {description}
      </p>
    </div>
  );
}
