/**
 * SHADOW CAT Security & Core Client Suite
 * Features:
 * - Deterministic Dark/Light Mode Theme Engine with Pure Icon Toggle
 * - Zero-Telemetry Local Storage & Cookie Privacy Consent
 * - Anti-Clickjacking Frame Buster
 * - Accessible Copy-to-Clipboard Handler
 */

(function () {
  'use strict';

  // 1. ANTI-CLICKJACKING PROTECTION (Client-Side Fallback)
  if (window.top !== window.self) {
    try {
      window.top.location = window.self.location;
    } catch (e) {
      document.documentElement.style.display = 'none';
    }
  }

  // 2. THEME ENGINE INITIALIZATION
  const THEME_KEY = 'shadowcat_theme';
  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    updateThemeToggleButtons(theme);
  }

  // Apply immediately to prevent flash
  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains('light');
    const newTheme = isLight ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }

  function updateThemeToggleButtons(theme) {
    const buttons = document.querySelectorAll('.theme-toggle-btn');
    const isLight = theme === 'light';

    // Sun SVG icon (displayed when in dark mode to switch to light)
    const sunIcon = `
      <svg class="w-4 h-4 text-amber-400 transition-transform duration-200 group-hover:rotate-45" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;

    // Moon SVG icon (displayed when in light mode to switch to dark)
    const moonIcon = `
      <svg class="w-4 h-4 text-slate-700 transition-transform duration-200 group-hover:-rotate-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;

    buttons.forEach((btn) => {
      btn.innerHTML = isLight ? moonIcon : sunIcon;
      btn.title = isLight ? "Switch to Dark Mode" : "Switch to Light Mode";
      btn.setAttribute('aria-label', btn.title);
      btn.classList.add('group');
    });
  }

  // 3. COOKIE & PRIVACY CONSENT BANNER
  const CONSENT_KEY = 'shadowcat_cookie_consent_v1';

  function initCookieBanner() {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent) return; // Already acknowledged

    const banner = document.createElement('div');
    banner.id = 'shadowcat-privacy-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-4 rounded-xl bg-cyber-card border border-cyber-border shadow-2xl space-y-3 backdrop-blur-lg';
    banner.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-mono text-xs font-bold text-white uppercase tracking-wider">[PRIVACY & AIR-GAP NOTICE]</span>
        </div>
        <button id="cookie-close-btn" class="text-slate-400 hover:text-white text-xs font-mono">&times;</button>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">
        SHADOW CAT operates under strict operational security standards: <strong>Zero tracking cookies</strong>, <strong>Zero advertising scripts</strong>, and <strong>Zero remote analytics</strong>. We store only essential UI state (Theme and Installation preferences) directly in your browser's local storage.
      </p>
      <div class="flex items-center gap-2 pt-1">
        <button id="cookie-accept-all" class="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors font-mono">
          Accept Local Storage
        </button>
        <button id="cookie-essential" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors font-mono border border-cyber-border">
          Essential Only
        </button>
        <a href="security.html#data-privacy" class="text-[11px] font-mono text-emerald-400 hover:underline px-1">
          Policy
        </a>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('cookie-accept-all')?.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'all');
      banner.remove();
    });

    document.getElementById('cookie-essential')?.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'essential');
      banner.remove();
    });

    document.getElementById('cookie-close-btn')?.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'dismissed');
      banner.remove();
    });
  }

  // 4. GLOBAL COPY CLIPBOARD HELPER
  window.copySnippet = function (text, btnElement) {
    if (!navigator.clipboard) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } else {
      navigator.clipboard.writeText(text);
    }

    if (btnElement) {
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = `<span class="text-emerald-400 font-mono font-bold">[COPIED!]</span>`;
      btnElement.classList.add('border-emerald-500');
      setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.classList.remove('border-emerald-500');
      }, 2000);
    }
  };

  // 6. RESPONSIVE MOBILE NAVIGATION TOGGLE
  window.toggleMobileNav = function () {
    const menu = document.getElementById('mobile-nav-menu');
    const btn = document.getElementById('mobile-menu-toggle');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    } else {
      menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  };

  // 7. DOM READY HOOKS
  document.addEventListener('DOMContentLoaded', () => {
    // Attach theme toggles
    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });
    updateThemeToggleButtons(getPreferredTheme());

    // Attach mobile navigation toggle
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', window.toggleMobileNav);
    }
    document.querySelectorAll('#mobile-nav-menu a').forEach((link) => {
      link.addEventListener('click', () => {
        const menu = document.getElementById('mobile-nav-menu');
        if (menu) menu.classList.add('hidden');
      });
    });

    // Initialize Cookie Banner after slight delay
    setTimeout(initCookieBanner, 800);
  });
})();
