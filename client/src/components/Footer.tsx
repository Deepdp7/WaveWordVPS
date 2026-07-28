import { Mail, Phone, Globe, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-muted mb-4 flex items-center gap-2">
              <img src="/logo.png" alt="Wave Word Logo" className="h-6 w-6" />
              Wave Word
            </h3>
            <p className="text-muted max-w-sm">
              Premium static hosting and dedicated VPS infrastructure. Launch your next project in seconds.
            </p>
          </div>
          <div className="flex flex-col space-y-4 md:items-end">
            <h4 className="text-lg font-semibold text-text">Contact Information</h4>
            <div className="flex flex-col space-y-2 md:items-end text-muted">
              <a href="mailto:waveword015@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={16} /> waveword015@gmail.com
              </a>
              <a href="tel:7980975812" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone size={16} /> 7980975812
              </a>
              <a href="https://waveword.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Globe size={16} /> waveword.in
              </a>
              <a href="https://ai.waveword.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Cpu size={16} /> ai.waveword.in
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-muted text-sm">
          &copy; {new Date().getFullYear()} Wave Word. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
