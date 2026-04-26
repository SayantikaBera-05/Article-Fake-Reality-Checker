import { Link } from 'react-router-dom';
import SocialLoginButton from '../components/ui/SocialLoginButton';
import InputGroup from '../components/ui/InputGroup';

export default function SignIn() {
  return (
    <main className="flex-grow flex items-center justify-center p-8 relative z-10 pt-24 min-h-screen">
      {/* Ambient Background Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-container/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary-container/10 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop')] opacity-[0.03] mix-blend-overlay" style={{ backgroundSize: 'cover' }}></div>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-surface-container/40 backdrop-blur-[40px] border border-white/10 rounded-xl shadow-[0_16px_64px_rgba(0,0,0,0.6)] overflow-hidden relative">
        {/* Inner Glow Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container/50 to-transparent"></div>
        <div className="p-8 flex flex-col gap-6">
          
          {/* Header / Brand */}
          <div className="text-center flex flex-col gap-2 items-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(0,242,255,0.15)]">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: '28px' }}>policy</span>
            </div>
            <h1 className="font-h2 text-h2 text-on-surface">TruthLens</h1>
            <p className="font-body-md text-on-surface-variant">Initialize neural session.</p>
          </div>

          {/* Tabs (UI Visual Only) */}
          <div className="flex p-1 bg-surface-container-highest/50 rounded-lg border border-white/5">
            <button className="flex-1 py-2 font-label-caps text-[12px] font-semibold tracking-[0.1em] rounded bg-surface/80 text-primary-container shadow-sm border border-white/5 transition-all">Sign In</button>
            <button className="flex-1 py-2 font-label-caps text-[12px] font-semibold tracking-[0.1em] rounded text-on-surface-variant hover:text-on-surface transition-all">Sign Up</button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4">
            <InputGroup 
              id="email"
              label="Email Address"
              type="email"
              placeholder="agent@truthlens.ai"
              icon="mail"
            />
            
            <InputGroup 
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              icon="key"
              rightElement={
                <Link to="#" className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-primary-container hover:text-primary transition-colors">
                  Recover?
                </Link>
              }
            />

            <button className="mt-2 w-full py-3 bg-primary-container text-on-primary-container font-label-caps text-[12px] font-semibold tracking-[0.1em] rounded-md hover:bg-primary transition-colors flex items-center justify-center gap-2 group" type="button">
              Authenticate
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px bg-white/10 flex-grow"></div>
            <span className="font-label-caps text-[12px] font-semibold tracking-[0.1em] text-outline-variant">OR CONTINUE WITH</span>
            <div className="h-px bg-white/10 flex-grow"></div>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col gap-2">
            <SocialLoginButton 
              provider="Google"
              icon={
                <svg aria-hidden="true" className="w-5 h-5 text-on-surface" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.879 4.722 6.876 6.876 0 0 0 4.799 1.835 6.26 6.26 0 0 0 4.11-1.391 5.922 5.922 0 0 0 2.062-3.824H12.037v-3.23h8.397c.105.74.156 1.492.152 2.247a10.024 10.024 0 0 1-2.617 6.861 9.957 9.957 0 0 1-6.19 2.895l-.265.006Z" fillRule="evenodd"></path>
                </svg>
              }
            />
            <SocialLoginButton 
              provider="GitHub"
              icon={
                <svg aria-hidden="true" className="w-5 h-5 text-on-surface" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M12 2c-5.523 0-10 4.477-10 10 0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10Z" fillRule="evenodd"></path>
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
