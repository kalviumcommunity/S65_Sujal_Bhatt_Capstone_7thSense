import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthRedirect } from '../../utils/auth';

function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    handleAuthRedirect(navigate, path);
  };

  return (
    <footer className="w-full space-bg pt-10 pb-6 px-2">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-6 flex-wrap">
        {/* Left: Logo, description, socials */}
        <div className="flex flex-col items-center sm:items-start gap-3 min-w-[220px] flex-1">
          <div className="flex items-center mb-1">
            <span className="bg-white rounded-lg px-2 py-1 font-bold text-black text-2xl tracking-wide mr-2">7th</span>
            <span className="text-white text-2xl font-bold tracking-wide">Sense</span>
          </div>
          <p className="text-gray-300 text-base text-center sm:text-left max-w-xs">
            Where quick thinking meets thrilling competition. Join the fastest-growing gaming platform and prove your instincts.
          </p>
          <div className="flex space-x-3 mt-1">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-neutral-900 hover:bg-blue-600 transition-colors rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-neutral-900 hover:bg-pink-600 transition-colors rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="bg-neutral-900 hover:bg-indigo-700 transition-colors rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
            </a>
          </div>
        </div>

        {/* Center: Quick Links & Support */}
        <div className="flex flex-col items-center gap-3 min-w-[220px] flex-1">
          <div className="flex flex-wrap justify-center gap-2 mb-1">
            <a href="#timer-section" className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">How It Works</a>
            <button onClick={() => handleNavigation('/game-modes')} className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">Game Modes</button>
            <button onClick={() => handleNavigation('/profile')} className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">Profile</button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <a href="#faq-section" className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">FAQ</a>
            <button onClick={() => handleNavigation('/contact')} className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">Contact Us</button>
          </div>
        </div>

        {/* Right: Legal & Contact */}
        <div className="flex flex-col items-center sm:items-end gap-3 min-w-[220px] flex-1">
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 mb-1">
            <button onClick={() => handleNavigation('/terms')} className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">Terms</button>
            <button onClick={() => handleNavigation('/privacy')} className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">Privacy</button>
            <button onClick={() => handleNavigation('/cookies')} className="bg-neutral-900 hover:bg-indigo-700 text-gray-100 px-5 py-2 rounded-full text-base font-medium transition-colors">Cookies</button>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <a href="mailto:7thense.connect@gmail.com" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">7thsense.connect@gmail.com</a>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-neutral-800 pt-4 text-center text-gray-500 text-sm">
        © 2025 7th Sense. All rights reserved.  
      </div>
    </footer>
  );
}

export default Footer; 