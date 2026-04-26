import { useState } from 'react';
import TabNavigation from '../components/ui/TabNavigation';
import DragDropZone from '../components/ui/DragDropZone';

export default function VerificationPage() {
  const [activeTab, setActiveTab] = useState('image');

  const tabs = [
    { id: 'article', icon: 'article', label: 'Paste Article Text' },
    { id: 'image', icon: 'image', label: 'Upload Image' },
    { id: 'link', icon: 'link', label: 'Enter URL' },
  ];

  return (
    <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 px-8 relative z-10 w-full max-w-[1440px] mx-auto">
      {/* Ambient Background Glows */}
      <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header */}
      <div className="text-center mb-12 relative z-20">
        <h1 className="font-h1 text-h1 text-on-surface mb-2 drop-shadow-md">Verify Content</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Submit raw articles, images, or direct URLs for comprehensive deep-scan analysis against our global verification network.
        </p>
      </div>

      {/* Glassmorphic Input Card */}
      <div className="w-full max-w-4xl bg-surface-container/30 backdrop-blur-[40px] border border-white/10 rounded-xl shadow-2xl relative z-20 overflow-hidden">
        {/* Tabs Header */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="p-12 flex flex-col gap-6">
          
          {activeTab === 'image' && (
            <DragDropZone />
          )}

          {activeTab === 'article' && (
            <div className="w-full h-[300px]">
              <textarea 
                className="w-full h-full bg-surface-container-low/40 border border-outline-variant rounded-lg p-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-body-md"
                placeholder="Paste the article text here..."
              />
            </div>
          )}

          {activeTab === 'link' && (
            <div className="w-full flex items-center bg-surface-container-low/40 border border-outline-variant rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <span className="material-symbols-outlined text-outline mr-3">link</span>
              <input 
                type="url" 
                className="flex-grow bg-transparent border-none outline-none text-on-surface font-body-md"
                placeholder="https://example.com/article"
              />
            </div>
          )}

          {/* Input Footer & Actions */}
          <div className="flex items-center justify-between mt-2 pt-6 border-t border-white/5">
            {/* Options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="hidden peer" />
                <div className="w-4 h-4 rounded border border-outline-variant peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[12px] text-transparent peer-checked:text-on-primary transition-colors">
                    check
                  </span>
                </div>
                <span className="font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Include reverse image search
                </span>
              </label>
            </div>

            {/* Primary Action Button with Neon Cyan Glow */}
            <button className="bg-primary text-on-primary font-label-caps text-[12px] font-semibold tracking-[0.1em] px-12 py-4 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,255,0.4)] hover:shadow-[0_0_25px_rgba(0,242,255,0.7)] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <span className="material-symbols-outlined text-[18px]">policy</span>
              Verify Information
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
