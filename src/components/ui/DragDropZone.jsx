export default function DragDropZone({ onFileSelect }) {
  return (
    <div className="w-full h-[300px] rounded-lg border-2 border-dashed border-outline-variant hover:border-primary-container/50 bg-surface-container-low/40 hover:bg-surface-container-low/80 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer group relative overflow-hidden">
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/5 transition-colors duration-500 rounded-lg pointer-events-none"></div>
      
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:border-primary-container/30 group-hover:shadow-[0_0_20px_rgba(0,242,255,0.2)] transition-all duration-500">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors duration-300">
          cloud_upload
        </span>
      </div>
      
      <div className="text-center relative z-10">
        <h3 className="font-h3 text-h3 text-on-surface mb-1 group-hover:text-primary-fixed transition-colors duration-300">
          Drag &amp; drop your image here
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          or{' '}
          <span className="text-primary underline decoration-primary/50 underline-offset-4 hover:decoration-primary transition-colors">
            browse files
          </span>{' '}
          from your device
        </p>
      </div>
      
      <p className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-outline mt-2 relative z-10">
        Supports JPG, PNG, WEBP up to 20MB
      </p>
    </div>
  );
}
