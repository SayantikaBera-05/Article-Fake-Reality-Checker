import HistoryCard from '../components/ui/HistoryCard';

export default function UserDashboard() {
  const historyData = [
    {
      id: 1,
      icon: 'link',
      source: 'social-media-post.xyz',
      timeAgo: '2h ago',
      title: 'Viral video claiming major banking collapse imminent',
      description: 'Analysis indicates heavy deepfake manipulation in the audio track and recycled footage from 2008 financial crisis reports.',
      status: 'FAKE',
      confidence: 98,
    },
    {
      id: 2,
      icon: 'article',
      source: 'reuters.com',
      timeAgo: '5h ago',
      title: 'Global climate summit reaches unprecedented emissions agreement',
      description: 'Cross-referenced against official UN press releases, live broadcast feeds, and multiple verified journalistic networks. No discrepancies found.',
      status: 'VERIFIED',
      confidence: 95,
    },
    {
      id: 3,
      icon: 'forum',
      source: 'reddit-thread.txt',
      timeAgo: 'Yesterday',
      title: 'Leaked internal memo from TechCorp regarding upcoming layoffs',
      description: 'Document structure matches known internal templates, but metadata reveals recent modifications by an unknown entity. Awaiting further corroboration.',
      status: 'SUSPICIOUS',
      confidence: 62,
    },
    {
      id: 4,
      icon: 'image',
      source: 'Image Upload',
      timeAgo: 'Yesterday',
      title: 'Photo of political leader at controversial protest',
      description: 'Generative AI detection algorithms flagged this image with high certainty. Inconsistent lighting and anatomical anomalies detected in background subjects.',
      status: 'FAKE',
      confidence: 88,
    },
  ];

  return (
    <main className="flex-grow pt-32 pb-12 px-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
      {/* Page Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="font-h2 text-h2 text-on-surface mb-1">Verification History</h1>
          <p className="font-body-md text-on-surface-variant">Review and manage your previously analyzed claims and media.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input 
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/70" 
              placeholder="Search history..." 
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="px-4 py-1.5 rounded-full border border-primary text-primary bg-primary/10 font-label-caps text-[12px] font-semibold tracking-[0.1em] transition-all">ALL SCANS</button>
        <button className="px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant bg-surface-container hover:bg-surface-container-high font-label-caps text-[12px] font-semibold tracking-[0.1em] transition-all">REAL</button>
        <button className="px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant bg-surface-container hover:bg-surface-container-high font-label-caps text-[12px] font-semibold tracking-[0.1em] transition-all">FAKE</button>
        <button className="px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant bg-surface-container hover:bg-surface-container-high font-label-caps text-[12px] font-semibold tracking-[0.1em] transition-all">SUSPICIOUS</button>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {historyData.map(item => (
          <HistoryCard key={item.id} {...item} />
        ))}
      </div>
    </main>
  );
}
