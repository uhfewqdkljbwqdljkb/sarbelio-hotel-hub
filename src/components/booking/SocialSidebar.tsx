import React from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

export const SocialSidebar: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col items-center absolute left-8 top-1/2 -translate-y-1/2 gap-8 z-20">
      <div className="flex flex-col items-center gap-6">
        <span className="writing-vertical-rl rotate-180 text-xs tracking-[0.5em] font-light text-white/70 uppercase mb-4" style={{ writingMode: 'vertical-rl' }}>
          Follow
        </span>
        <div className="w-[1px] h-12 bg-white/30"></div>
      </div>
      
      <div className="flex flex-col gap-6 text-white/70">
        <a href="#" className="hover:text-white hover:scale-110 transition-all duration-300">
          <Facebook size={18} strokeWidth={1.5} />
        </a>
        <a href="#" className="hover:text-white hover:scale-110 transition-all duration-300">
          <Instagram size={18} strokeWidth={1.5} />
        </a>
        <a href="#" className="hover:text-white hover:scale-110 transition-all duration-300">
          <MessageCircle size={18} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
};
