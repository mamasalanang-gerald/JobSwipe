import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#111] py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-white text-xl font-medium mb-2">
              <span className="text-[#FF4E6A]">●</span> JobSwipe
            </div>
            <p className="text-white/40 text-sm mb-5">Swipe your way to your dream job</p>

            {/* App store buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <a href="#" className="flex items-center gap-3 border border-white/20 rounded-xl px-3 py-2 hover:bg-white/5 transition w-fit">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-white/50 text-[10px] leading-none">Download on the</p>
                  <p className="text-white text-sm font-medium">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 border border-white/20 rounded-xl px-3 py-2 hover:bg-white/5 transition w-fit">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                  <path d="M3.18 23.76c.3.17.64.22.99.15l13.23-7.62-2.84-2.84-11.38 10.31zM.5 1.47C.19 1.81 0 2.33 0 3.01v17.98c0 .68.19 1.2.51 1.54l.08.07 10.07-10.06v-.25L.58 1.4.5 1.47zM20.49 10.34l-2.86-1.65-3.19 3.19 3.19 3.19 2.88-1.66c.82-.47.82-1.25-.02-1.07zM3.18.24l13.27 7.66-2.84 2.84L2.18.37C2.52.06 2.87.07 3.18.24z"/>
                </svg>
                <div>
                  <p className="text-white/50 text-[10px] leading-none">Get it on</p>
                  <p className="text-white text-sm font-medium">Google Play</p>
                </div>
              </a>
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {[
                { label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
              ].map(({ label, path }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/8 transition">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white/60 hover:fill-white">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              {['Features', 'Pricing', 'For Companies'].map(l => (
                <li key={l}><a href="#" className="text-white/40 hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {['About', 'Blog', 'Careers'].map(l => (
                <li key={l}><a href="#" className="text-white/40 hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <li key={l}><a href="#" className="text-white/40 hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/30">
          <p>© {new Date().getFullYear()} JobSwipe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}