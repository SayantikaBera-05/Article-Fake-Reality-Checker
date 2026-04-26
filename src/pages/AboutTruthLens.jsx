import ProcessStepCard from '../components/ui/ProcessStepCard';

export default function AboutTruthLens() {
  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-8 py-24 flex flex-col gap-12 pt-32">
      {/* Hero Section */}
      <section className="relative w-full rounded-xl overflow-hidden bg-surface-container/40 backdrop-blur-[20px] border border-white/10 min-h-[400px] flex items-center justify-center text-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest to-surface-container-highest opacity-80 -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/10 via-transparent to-transparent -z-10"></div>
        <div className="max-w-3xl z-10 space-y-4">
          <h1 className="font-h1 text-h1 text-primary">Illuminating the Digital Truth</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            In an era of deepfakes and algorithmic manipulation, TruthLens provides the clarity you need. We are a dedicated team of AI researchers and data scientists building the ultimate verification engine.
          </p>
        </div>
      </section>

      {/* Mission Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 bg-surface-container/40 backdrop-blur-[20px] border border-white/10 rounded-xl p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl group-hover:bg-secondary-container/30 transition-all duration-500"></div>
          <h2 className="font-h2 text-h2 text-secondary mb-2">Our Mission</h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl">
            To dismantle the infrastructure of digital deception. We believe that access to verifiable truth is a fundamental right in the information age. By leveraging advanced neural networks, we aim to instantly detect synthetic media, altered documents, and coordinated disinformation campaigns, giving power back to the informed individual.
          </p>
        </div>
        
        <div className="col-span-1 md:col-span-4 bg-surface-container/40 backdrop-blur-[20px] border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-primary-container text-6xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
          <h3 className="font-h3 text-h3 text-on-surface mb-1">Absolute Clarity</h3>
          <p className="font-body-md text-on-surface-variant text-sm">Cutting through the noise with precision analytics.</p>
        </div>
        
        <div className="col-span-1 md:col-span-4 bg-surface-container/40 backdrop-blur-[20px] border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-secondary text-6xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <h3 className="font-h3 text-h3 text-on-surface mb-1">Unbiased Verification</h3>
          <p className="font-body-md text-on-surface-variant text-sm">Neutral algorithms trained on verifiable source data.</p>
        </div>
        
        <div className="col-span-1 md:col-span-8 bg-surface-container/40 backdrop-blur-[20px] border border-white/10 rounded-xl p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')" }}></div>
          <div className="relative z-10">
            <h2 className="font-h2 text-h2 text-primary mb-2">Global Defense</h2>
            <p className="font-body-md text-on-surface-variant max-w-xl">
              Operating a decentralized network of validation nodes to monitor public data streams in real-time, catching anomalies before they spread.
            </p>
          </div>
        </div>
      </section>

      {/* The Technology (AI Model Explanation) */}
      <section className="bg-surface-container/40 backdrop-blur-[20px] border border-white/10 rounded-xl p-12 flex flex-col gap-6">
        <div className="text-center mb-4">
          <h2 className="font-h2 text-h2 text-on-surface">The TruthLens Neural Engine</h2>
          <p className="font-body-md text-on-surface-variant mt-2">A multi-modal approach to deepfake and manipulation detection.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProcessStepCard 
            number="1"
            title="Ingestion"
            description="Media or text is securely uploaded and parsed into thousands of micro-segments for granular analysis."
            colorClass="primary-container"
          />
          <ProcessStepCard 
            number="2"
            title="Forensic Scan"
            description="Our models analyze pixel anomalies, compression artifacts, and semantic inconsistencies against known truths."
            colorClass="secondary"
          />
          <ProcessStepCard 
            number="3"
            title="Verdict Generation"
            description="A comprehensive report is generated, providing a confidence score and highlighting specific areas of manipulation."
            colorClass="primary"
          />
        </div>
      </section>
    </main>
  );
}
