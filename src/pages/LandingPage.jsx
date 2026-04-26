import { Link } from 'react-router-dom';
import FeatureCard from '../components/ui/FeatureCard';
import StepCard from '../components/ui/StepCard';

export default function LandingPage() {
  return (
    <main className="flex-grow pt-24 px-8 max-w-[1440px] mx-auto w-full pb-12">
      {/* Hero Section */}
      <section className="gap-6 items-center min-h-[716px] mb-12 relative flex flex-col items-center justify-center text-center">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col gap-6 z-10 items-center text-center w-full">
          <h1 className="font-h1 text-h1 text-on-surface">Detect Fake Information Instantly</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px] mx-auto">
            Empower your digital experience with TruthLens. Our advanced AI fact-checking engine analyzes text, images, and sources in real-time to separate truth from fiction.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/verify" className="bg-primary-container text-on-primary-container font-h3 text-sm px-6 py-3 rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] border border-primary-container/50">
              Check Now
            </Link>
            <Link to="/about" className="bg-surface/50 backdrop-blur-[20px] text-primary-fixed-dim border border-primary-fixed-dim/30 font-h3 text-sm px-6 py-3 rounded-lg hover:bg-surface-bright/50 transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">Precision Detection Features</h2>
          <p className="font-body-md text-on-surface-variant">The core capabilities powering our truth engine.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon="psychology"
            title="AI Analysis"
            description="Deep learning models scan semantic context to identify logical fallacies and bias."
            colorClass="bg-secondary-container text-secondary"
            shadowClass="rgba(110,6,208,0.3)"
          />
          <FeatureCard 
            icon="image_search"
            title="Media Verification"
            description="Reverse searches and structural analysis detect deepfakes and altered images."
            colorClass="bg-primary-container text-primary-container"
            shadowClass="rgba(0,242,255,0.3)"
          />
          <FeatureCard 
            icon="speed"
            title="Fast Results"
            description="Sub-second processing architecture delivers verdicts instantly via API or dashboard."
            colorClass="bg-tertiary-container text-tertiary-fixed"
            shadowClass="rgba(226,212,255,0.3)"
          />
          <FeatureCard 
            icon="verified_user"
            title="Trusted Sources"
            description="Cross-references claims against thousands of verified academic and news databases."
            colorClass="bg-inverse-primary text-inverse-primary"
            shadowClass="rgba(0,105,111,0.3)"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-secondary-container/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="text-center mb-6">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">How TruthLens Works</h2>
          <p className="font-body-md text-on-surface-variant">Three simple steps to verify any claim.</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 relative z-10">
          <StepCard 
            icon="input"
            title="1. Input Data"
            description="Paste text, URLs, or upload images directly into the verification engine."
          />
          <div className="hidden md:block w-16 h-px bg-gradient-to-r from-transparent via-primary-container/50 to-transparent"></div>
          <StepCard 
            icon="memory"
            title="2. AI Scan"
            description="Our neural network cross-references facts and detects manipulation artifacts."
            isPulse={true}
          />
          <div className="hidden md:block w-16 h-px bg-gradient-to-r from-transparent via-primary-container/50 to-transparent"></div>
          <StepCard 
            icon="fact_check"
            title="3. Instant Verdict"
            description="Receive a detailed breakdown with confidence scores and source citations."
          />
        </div>
      </section>
    </main>
  );
}
