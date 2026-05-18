import { Link } from 'react-router-dom';

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export function Footer() {
  const team = [
    { name: "Joy", link: "https://www.linkedin.com/in/beinggojo/" },
    { name: "Shubhadip", link: "https://www.linkedin.com/in/shubhadip-patra-9846a4323/" },
    { name: "Aranya", link: "https://www.linkedin.com/in/aranya-karmakar-b68b53324/" },
    { name: "Sayantika", link: "https://www.linkedin.com/in/sayantika-bera-8b949731b/" }
  ];

  return (
    <footer className="w-full bg-slate-100/80 dark:bg-gray-100/80 backdrop-blur-md border-t border-slate-200 dark:border-gray-200/50 py-12 px-6 lg:px-12 z-40 relative transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
          <Link to="/" className="text-slate-900 dark:text-gray-900 font-bold text-2xl tracking-tight transition-colors">Verifi*</Link>
          <p className="text-gray-500 dark:text-gray-600">Where you verify realities.</p>
        </div>

          {/* Column 2: Built By */}
          <div className="space-y-4">
          <h3 className="text-slate-900 dark:text-gray-900 font-bold text-lg transition-colors">Built by</h3>
          <ul className="space-y-3">
              {team.map((member) => (
                <li key={member.name}>
                  <a 
                    href={member.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-500 dark:text-gray-600 hover:text-[#00F0FF] transition duration-200"
                  >
                    <LinkedinIcon className="w-4 h-4 mr-2" />
                    <span>{member.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4">
          <h3 className="text-slate-900 dark:text-gray-900 font-bold text-lg transition-colors">Resources</h3>
          <ul className="space-y-3">
              {["Data Safety", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-600 hover:text-slate-900 dark:hover:text-gray-900 transition duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-gray-200/50 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 dark:text-gray-600 text-sm">
        <p>© 2026 Verifi. All rights reserved.</p>
        <p>Powered by OpenRouter & Llama 3</p>
      </div>
    </footer>
  );
};
