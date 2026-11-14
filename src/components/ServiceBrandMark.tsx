import React from 'react';

interface BrandVisual {
  bg: string;
  accent: string;
  renderLogo: () => React.ReactNode;
}

export const BRAND_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'netflix', label: 'Netflix' },
  { key: 'prime', label: 'Amazon Prime Video' },
  { key: 'primeall', label: 'Amazon Prime All Benefits' },
  { key: 'hotstar', label: 'JioHotstar Super' },
  { key: 'hotstar4k', label: 'JioHotstar 4K Plus' },
  { key: 'youtube', label: 'YouTube Premium' },
  { key: 'zee5', label: 'ZEE5' },
  { key: 'hungama', label: 'Hungama Play' },
  { key: 'sonyliv', label: 'SonyLIV' },
  { key: 'f1tv', label: 'F1TV Premium' },
  { key: 'crunchyroll', label: 'Crunchyroll' },
  { key: 'appletv', label: 'Apple TV+' },
  { key: 'mysterybox', label: 'Mystery Box' },
  { key: 'hoichoi', label: 'Hoichoi' },
  { key: 'chaupal', label: 'Chaupal' },
  { key: 'aha', label: 'aha GOLD' },
  { key: 'fancode', label: 'FanCode' },
  { key: 'curiosity', label: 'Curiosity Stream' },
  { key: 'sunnxt', label: 'Sun NXT' },
  { key: 'lionsgate', label: 'Lionsgate Play' },
  { key: 'shemaroo', label: 'ShemarooMe' },
  { key: 'applemusic', label: 'Apple Music' },
  { key: 'tidal', label: 'TIDAL' },
  { key: 'gaana', label: 'Gaana Plus' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'vipgroup', label: 'VIP Membership Group' },
  { key: 'lovable', label: 'Lovable Pro' },
  { key: 'chatgpt', label: 'ChatGPT Plus' },
  { key: 'grok', label: 'Grok Plus' },
  { key: 'picsart', label: 'Picsart Pro' },
  { key: 'perplexity', label: 'Perplexity Pro' },
  { key: 'gemini', label: 'Google Gemini AI' },
  { key: 'claude500', label: 'Claude $500 API Key' },
  { key: 'claude100', label: 'Claude $100 API Key' },
  { key: 'claude', label: 'Claude Pro' },
  { key: 'gamma', label: 'Gamma 10K Credit' },
  { key: 'kling', label: 'Kling AI API 50K' },
  { key: 'canva', label: 'Canva Pro' },
  { key: 'googleone', label: 'Google One 2TB' },
  { key: 'linkedin', label: 'LinkedIn Career' },
  { key: 'linkedinbiz', label: 'LinkedIn Business' },
  { key: 'capcut', label: 'CapCut Pro' },
  { key: 'adobe', label: 'Adobe Creative Cloud' },
  { key: 'microsoft365', label: 'Microsoft Office 365' },
  { key: 'duolingo', label: 'Duolingo Super' },
  { key: 'coursera', label: 'Coursera Plus' },
  { key: 'udemy', label: 'Udemy Personal' },
  { key: 'scribd', label: 'Scribd' },
  { key: 'skillshare', label: 'SkillShare Premium' },
  { key: 'edx', label: 'edX Premium' },
  { key: 'discovery', label: 'Discovery Plus' },
  { key: 'mubi', label: 'Mubi Premium' },
  { key: 'notion', label: 'Notion Plus' },
  { key: 'figma', label: 'Figma Pro' },
  { key: 'adobeexpress', label: 'Adobe Express' },
  { key: 'autodesk', label: 'Autodesk 1 Year' },
  { key: 'jetbrains', label: 'JetBrains Edu Pack' },
  { key: 'ilovepdf', label: 'iLovePDF Premium' },
  { key: 'grammarly', label: 'Grammarly Premium' },
  { key: 'quillbot', label: 'QuillBot Premium' },
  { key: 'surfshark', label: 'Surfshark VPN' },
  { key: 'envato', label: 'Envato' },
  { key: 'museai', label: 'Muse AI' },
  { key: 'bolt', label: 'Bolt Pro' },
  { key: 'outlook', label: 'Outlook Accounts' },
  { key: 'proxy', label: 'Rotating Proxy' },
  { key: 'thyrocare', label: 'Thyrocare Health' },
  { key: 'ottcombo', label: 'OTT 4-App Combo' },
  { key: 'ottbusiness', label: 'OTT Business Setup' },
  { key: 'netmeds', label: 'Netmeds Membership' },
  { key: 'swiggy', label: 'Swiggy Discount Pass' },
  { key: 'nordvpn', label: 'NordVPN' },
  { key: 'custom', label: 'Custom Brand' },
];

const BRAND_VISUALS: Record<string, BrandVisual> = {
  netflix: {
    bg: 'bg-[#120406]',
    accent: 'border-[#E50914]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#B20710" d="M7 4h5v24H7z" />
        <path fill="#B20710" d="M20 4h5v24h-5z" />
        <path fill="#E50914" d="M7 4h5l13 24h-5z" />
      </svg>
    ),
  },
  prime: {
    bg: 'bg-[#081928]',
    accent: 'border-[#00A8E1]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#00A8E1" d="M8 7l15 9-15 9V7z" />
        <path d="M5 24c6.5 4.2 15.5 4.2 22 0" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  primeall: {
    bg: 'bg-[#061A35]',
    accent: 'border-[#38BDF8]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#38BDF8" d="M7 10l4-4h10l4 4v12l-9 5-9-5V10z" />
        <path d="M9 19c4.5 3 9.5 3 14 0" fill="none" stroke="#061A35" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    ),
  },
  hotstar: {
    bg: 'bg-[#0B1136]',
    accent: 'border-[#7C3AED]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#E0E7FF" d="M16 4l2.7 7.6L26.5 12l-6.1 4.9 2.1 7.7-6.5-4.4-6.5 4.4 2.1-7.7L5.5 12l7.8-.4z" />
      </svg>
    ),
  },
  hotstar4k: {
    bg: 'bg-[#120F40]',
    accent: 'border-[#A855F7]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#FDE047" d="M16 4l2.7 7.6L26.5 12l-6.1 4.9 2.1 7.7-6.5-4.4-6.5 4.4 2.1-7.7L5.5 12l7.8-.4z" />
      </svg>
    ),
  },
  youtube: {
    bg: 'bg-[#260608]',
    accent: 'border-[#FF0000]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="3" y="7" width="26" height="18" rx="5" fill="#FF0000" />
        <path fill="#FFFFFF" d="M13 11.5l8 4.5-8 4.5v-9z" />
      </svg>
    ),
  },
  zee5: {
    bg: 'bg-[#1D0B26]',
    accent: 'border-[#10B981]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#FFFFFF" />
        <path fill="#111115" d="M10.5 11.5h11v2.2l-6.6 4.8h6.6v2h-11v-2.2l6.6-4.8h-6.6v-2z" />
      </svg>
    ),
  },
  hungama: {
    bg: 'bg-[#09182D]',
    accent: 'border-[#06B6D4]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#22D3EE" d="M9 6l16 10L9 26V6z" />
        <path fill="#F97316" d="M9 6l8 5-8 5V6z" />
      </svg>
    ),
  },
  sonyliv: {
    bg: 'bg-[#120A2A]',
    accent: 'border-[#8B5CF6]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="6" width="24" height="20" rx="5" fill="#7C3AED" />
        <path fill="#FACC15" d="M10 10h3v9h5v3h-8V10zm10 0h3l-1.5 12h-1.5V10z" />
      </svg>
    ),
  },
  f1tv: {
    bg: 'bg-[#280607]',
    accent: 'border-[#EF4444]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#EF4444" d="M4 21l7-10h13l-2.5 3.5h-9l-2 3h7L15 21H4zm19-10h5l-7 10h-5l7-10z" />
      </svg>
    ),
  },
  crunchyroll: {
    bg: 'bg-[#261105]',
    accent: 'border-[#F47521]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#F47521" />
        <circle cx="18.5" cy="15.5" r="5" fill="#180A02" />
        <circle cx="20" cy="14" r="2" fill="#FFFFFF" />
      </svg>
    ),
  },
  appletv: {
    bg: 'bg-[#09182D]',
    accent: 'border-[#60A5FA]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#FFFFFF" d="M19.5 16.8c0-2.4 2-3.6 2.1-3.6-1.1-1.6-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.2-.9-1.7 0-3.2 1-4 2.5-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.7-1-2.7-4zm-2.3-7c.7-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.5-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.4z" />
      </svg>
    ),
  },
  mysterybox: {
    bg: 'bg-[#250A0A]',
    accent: 'border-[#F59E0B]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="6" y="12" width="20" height="14" rx="2" fill="#F59E0B" />
        <rect x="4" y="8" width="24" height="5" rx="1.5" fill="#FBBF24" />
        <rect x="14.5" y="8" width="3" height="18" fill="#E50914" />
      </svg>
    ),
  },
  hoichoi: {
    bg: 'bg-[#26060B]',
    accent: 'border-[#EF4444]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#EF4444" d="M7 6h5v8h8V6h5v20h-5v-8h-8v8H7z" />
        <path fill="#FFFFFF" d="M14 13l5 3-5 3v-6z" />
      </svg>
    ),
  },
  chaupal: {
    bg: 'bg-[#4A1259]',
    accent: 'border-[#D946EF]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="6" width="24" height="20" rx="4" fill="#701A75" />
        <text x="16" y="20" textAnchor="middle" fill="#FACC15" fontSize="11" fontWeight="900">CH</text>
      </svg>
    ),
  },
  aha: {
    bg: 'bg-[#261103]',
    accent: 'border-[#F97316]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill="#F97316" />
        <text x="16" y="19.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">aha</text>
      </svg>
    ),
  },
  fancode: {
    bg: 'bg-[#260A05]',
    accent: 'border-[#FB923C]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#F97316" d="M8 7h17l-2.5 5H13v3h8l-2 4h-6v7H8V7z" />
      </svg>
    ),
  },
  curiosity: {
    bg: 'bg-[#1D160B]',
    accent: 'border-[#FBBF24]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="none" stroke="#FBBF24" strokeWidth="3" />
        <circle cx="16" cy="16" r="3.5" fill="#FBBF24" />
      </svg>
    ),
  },
  sunnxt: {
    bg: 'bg-[#350718]',
    accent: 'border-[#EC4899]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="5" fill="#E11D48" />
        <text x="16" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900">SUN</text>
      </svg>
    ),
  },
  lionsgate: {
    bg: 'bg-[#091C1F]',
    accent: 'border-[#2DD4BF]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#22D3EE" d="M8 7h5v13h11v5H8V7z" />
      </svg>
    ),
  },
  shemaroo: {
    bg: 'bg-[#1F1F24]',
    accent: 'border-[#F59E0B]/40',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#FFFFFF" />
        <path fill="#EC4899" d="M9 11l14 5-14 5V11z" />
      </svg>
    ),
  },
  applemusic: {
    bg: 'bg-[#280711]',
    accent: 'border-[#FA2D48]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#FA2D48" />
        <path fill="#FFFFFF" d="M21 9v10.5a2.5 2.5 0 1 1-2-2.45V13l-6 1.5v6.5a2.5 2.5 0 1 1-2-2.45V11l10-2z" />
      </svg>
    ),
  },
  tidal: {
    bg: 'bg-[#0A131C]',
    accent: 'border-[#22D3EE]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#FFFFFF" d="M7 10l4 4-4 4-4-4 4-4zm9 0l4 4-4 4-4-4 4-4zm9 0l4 4-4 4-4-4 4-4zm-9 9l4 4-4 4-4-4 4-4z" />
      </svg>
    ),
  },
  gaana: {
    bg: 'bg-[#260608]',
    accent: 'border-[#E72C30]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#E72C30" />
        <text x="16" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">g</text>
      </svg>
    ),
  },
  spotify: {
    bg: 'bg-[#0A1F12]',
    accent: 'border-[#1DB954]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill="#1DB954" />
        <path d="M9.5 12.5c4.5-1.4 9.6-1.1 13.5 1.1M10.5 16.5c3.7-1.1 7.8-.8 11 .9M11.6 20.2c2.8-.7 5.8-.5 8.2.8" fill="none" stroke="#09150E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  vipgroup: {
    bg: 'bg-[#241A06]',
    accent: 'border-[#F59E0B]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#FBBF24" d="M5 22l2-11 6 5 3-7 3 7 6-5 2 11H5zm0 2h22v3H5v-3z" />
      </svg>
    ),
  },
  lovable: {
    bg: 'bg-[#1D1030]',
    accent: 'border-[#EC4899]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#F43F5E" d="M16 26S6 19.6 6 12.5C6 9 8.7 6.5 12 6.5c2 0 3.3 1 4 2.2.7-1.2 2-2.2 4-2.2 3.3 0 6 2.5 6 6 0 7.1-10 13.5-10 13.5z" />
      </svg>
    ),
  },
  chatgpt: {
    bg: 'bg-[#091F1A]',
    accent: 'border-[#10A37F]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="none" stroke="#10A37F" strokeWidth="2.4" />
        <path d="M16 7v18M8.2 11.5l15.6 9M23.8 11.5l-15.6 9" stroke="#10A37F" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3" fill="#091F1A" stroke="#10A37F" strokeWidth="2" />
      </svg>
    ),
  },
  grok: {
    bg: 'bg-[#180D09]',
    accent: 'border-[#F97316]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M7 25L25 7" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  picsart: {
    bg: 'bg-[#1F0B36]',
    accent: 'border-[#D946EF]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="14" r="8" fill="none" stroke="#EC4899" strokeWidth="4" />
        <rect x="8" y="14" width="4" height="12" rx="2" fill="#38BDF8" />
      </svg>
    ),
  },
  perplexity: {
    bg: 'bg-[#081F24]',
    accent: 'border-[#22D3EE]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="none" stroke="#22D3EE" strokeWidth="2" d="M16 4v24M7 10l9 6 9-6M7 22l9-6 9 6M7 10v12M25 10v12" />
      </svg>
    ),
  },
  gemini: {
    bg: 'bg-[#0C1436]',
    accent: 'border-[#60A5FA]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#60A5FA" d="M16 4c1 6.5 4.5 10 11 11-6.5 1-10 4.5-11 11-1-6.5-4.5-10-11-11 6.5-1 10-4.5 11-11z" />
      </svg>
    ),
  },
  claude: {
    bg: 'bg-[#22140C]',
    accent: 'border-[#D97757]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path d="M16 5v22M5 16h22M8.2 8.2l15.6 15.6M23.8 8.2L8.2 23.8" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3.2" fill="#22140C" />
      </svg>
    ),
  },
  claude500: {
    bg: 'bg-[#281209]',
    accent: 'border-[#FB923C]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path d="M16 5v22M5 16h22M8.2 8.2l15.6 15.6M23.8 8.2L8.2 23.8" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3.2" fill="#281209" />
      </svg>
    ),
  },
  claude100: {
    bg: 'bg-[#261109]',
    accent: 'border-[#F97316]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path d="M16 5v22M5 16h22M8.2 8.2l15.6 15.6M23.8 8.2L8.2 23.8" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3.2" fill="#261109" />
      </svg>
    ),
  },
  gamma: {
    bg: 'bg-[#09183B]',
    accent: 'border-[#3B82F6]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#38BDF8" d="M16 4L6 10v12l10 6 10-6v-7h-9v4h4v1l-5 3-6-3.5V12.5L16 9l6 3.5V10L16 4z" />
      </svg>
    ),
  },
  kling: {
    bg: 'bg-[#071D26]',
    accent: 'border-[#2DD4BF]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="13" cy="16" r="6" fill="none" stroke="#34D399" strokeWidth="3" />
        <circle cx="19" cy="16" r="6" fill="none" stroke="#38BDF8" strokeWidth="3" />
      </svg>
    ),
  },
  canva: {
    bg: 'bg-[#0C212A]',
    accent: 'border-[#00C4CC]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill="#00C4CC" />
        <path d="M20.2 12.2a5.2 5.2 0 1 0 0 7.6" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  googleone: {
    bg: 'bg-[#141720]',
    accent: 'border-white/25',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#4285F4" d="M17 6v20h4V6z" />
        <path fill="#EA4335" d="M11 11.5l6-5.5v5l-3.5 3.3z" />
        <path fill="#FBBC05" d="M11 11.5h3.5v4.5H11z" />
      </svg>
    ),
  },
  linkedin: {
    bg: 'bg-[#0B1C2E]',
    accent: 'border-[#0A66C2]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="5" fill="#0A66C2" />
        <path fill="#FFFFFF" d="M9.5 13h3v10h-3V13zm1.5-4.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zm4.5 4.5h2.9v1.4h.04c.4-.8 1.4-1.6 2.96-1.6 3.16 0 3.74 2.08 3.74 4.78V23h-3v-4.8c0-1.15-.02-2.62-1.6-2.62-1.6 0-1.84 1.25-1.84 2.54V23h-3V13z" />
      </svg>
    ),
  },
  linkedinbiz: {
    bg: 'bg-[#0B1C2E]',
    accent: 'border-[#38BDF8]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" rx="5" fill="#0A66C2" />
        <path fill="#FFFFFF" d="M9.5 13h3v10h-3V13zm1.5-4.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zm4.5 4.5h2.9v1.4h.04c.4-.8 1.4-1.6 2.96-1.6 3.16 0 3.74 2.08 3.74 4.78V23h-3v-4.8c0-1.15-.02-2.62-1.6-2.62-1.6 0-1.84 1.25-1.84 2.54V23h-3V13z" />
      </svg>
    ),
  },
  capcut: {
    bg: 'bg-[#091522]',
    accent: 'border-[#22D3EE]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" d="M7 9l18 14M25 9L7 23" />
      </svg>
    ),
  },
  adobe: {
    bg: 'bg-[#260608]',
    accent: 'border-[#FA0F00]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="5" width="24" height="22" rx="4" fill="#FA0F00" />
        <path fill="#FFFFFF" d="M16 9l6 14h-3.6l-1.5-3.6h-3.7L16 14l1.5 3.6h-2.8L12.6 23H10l6-14z" />
      </svg>
    ),
  },
  microsoft365: {
    bg: 'bg-[#0F172A]',
    accent: 'border-[#38BDF8]/45',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="5" y="5" width="10" height="10" rx="1.5" fill="#F25022" />
        <rect x="17" y="5" width="10" height="10" rx="1.5" fill="#7FBA00" />
        <rect x="5" y="17" width="10" height="10" rx="1.5" fill="#00A4EF" />
        <rect x="17" y="17" width="10" height="10" rx="1.5" fill="#FFB900" />
      </svg>
    ),
  },
  duolingo: {
    bg: 'bg-[#0C2912]',
    accent: 'border-[#58CC02]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="6" width="24" height="20" rx="8" fill="#58CC02" />
        <circle cx="11.5" cy="15" r="3" fill="#FFFFFF" />
        <circle cx="20.5" cy="15" r="3" fill="#FFFFFF" />
        <circle cx="11.5" cy="15" r="1.4" fill="#18181B" />
        <circle cx="20.5" cy="15" r="1.4" fill="#18181B" />
        <path fill="#F59E0B" d="M14 19h4l-2 3-2-3z" />
      </svg>
    ),
  },
  netmeds: {
    bg: 'bg-[#09292B]',
    accent: 'border-[#14B8A6]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="5" y="5" width="22" height="22" rx="5" fill="#14B8A6" />
        <path fill="#FFFFFF" d="M14 9h4v5h5v4h-5v5h-4v-5H9v-4h5V9z" />
      </svg>
    ),
  },
  swiggy: {
    bg: 'bg-[#2C1204]',
    accent: 'border-[#FC8019]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#FC8019" d="M16 4c-4.5 0-8 3.6-8 8 0 6 8 16 8 16s8-10 8-16c0-4.4-3.5-8-8-8zm0 11.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
      </svg>
    ),
  },
  nordvpn: {
    bg: 'bg-[#0C1736]',
    accent: 'border-[#4687FF]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#4687FF" d="M16 5L5 24h5.5l4-7.2L17 21l3-4.8 4.5 7.8H27L16 5z" />
      </svg>
    ),
  },
  surfshark: {
    bg: 'bg-[#072629]',
    accent: 'border-[#1ECAD3]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#1ECAD3" d="M6 22c4-8 10-13 18-14-3 7-3 12 0 16-6-2-12-2-18-2z" />
      </svg>
    ),
  },
  discovery: {
    bg: 'bg-[#0A1E3D]',
    accent: 'border-[#0074E8]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="15" cy="16" r="10" fill="#0074E8" />
        <path fill="#FFFFFF" d="M21 15h6v2h-6v3h-2v-3h-3v-2h3v-3h2v3z" />
      </svg>
    ),
  },
  mubi: {
    bg: 'bg-[#0C0C24]',
    accent: 'border-[#6366F1]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="10" cy="10" r="3" fill="#FFFFFF" />
        <circle cx="18" cy="10" r="3" fill="#FFFFFF" />
        <circle cx="10" cy="18" r="3" fill="#FFFFFF" />
        <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
        <circle cx="25" cy="14" r="3" fill="#818CF8" />
      </svg>
    ),
  },
  coursera: {
    bg: 'bg-[#081F44]',
    accent: 'border-[#0056D2]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#0056D2" />
        <path d="M20.5 11.8a6 6 0 1 0 0 8.4" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    ),
  },
  udemy: {
    bg: 'bg-[#221036]',
    accent: 'border-[#A435F0]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#A435F0" d="M16 5l6 3.5v3l-6-3.5-6 3.5v-3L16 5z" />
        <path fill="#FFFFFF" d="M10 13h4v8a2 2 0 1 0 4 0v-8h4v8a6 6 0 1 1-12 0v-8z" />
      </svg>
    ),
  },
  scribd: {
    bg: 'bg-[#08222B]',
    accent: 'border-[#1E7B85]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="6" y="5" width="20" height="22" rx="4" fill="#1E7B85" />
        <text x="16" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="900">S</text>
      </svg>
    ),
  },
  skillshare: {
    bg: 'bg-[#07291E]',
    accent: 'border-[#00FF84]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="6" width="24" height="20" rx="5" fill="#00FF84" />
        <text x="16" y="20" textAnchor="middle" fill="#041F16" fontSize="10.5" fontWeight="900">SS</text>
      </svg>
    ),
  },
  edx: {
    bg: 'bg-[#290915]',
    accent: 'border-[#D23228]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="6" width="24" height="20" rx="5" fill="#D23228" />
        <text x="16" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900">edX</text>
      </svg>
    ),
  },
  notion: {
    bg: 'bg-[#19191B]',
    accent: 'border-white/30',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="5" y="5" width="22" height="22" rx="4" fill="#FFFFFF" />
        <text x="16" y="21" textAnchor="middle" fill="#111114" fontSize="14" fontWeight="900">N</text>
      </svg>
    ),
  },
  figma: {
    bg: 'bg-[#1C1229]',
    accent: 'border-[#A259FF]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="12" cy="9" r="4" fill="#F24E1E" />
        <circle cx="20" cy="9" r="4" fill="#FF7262" />
        <circle cx="12" cy="17" r="4" fill="#A259FF" />
        <circle cx="20" cy="17" r="4" fill="#1ABCFE" />
        <circle cx="12" cy="25" r="4" fill="#0ACF83" />
      </svg>
    ),
  },
  adobeexpress: {
    bg: 'bg-[#210C3A]',
    accent: 'border-[#A855F7]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="5" width="24" height="22" rx="5" fill="#7C3AED" />
        <text x="16" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">Ax</text>
      </svg>
    ),
  },
  autodesk: {
    bg: 'bg-[#092420]',
    accent: 'border-[#10B981]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#10B981" d="M16 5L6 26h5l5-11 5 11h5L16 5z" />
      </svg>
    ),
  },
  jetbrains: {
    bg: 'bg-[#260D2A]',
    accent: 'border-[#FF318C]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="5" width="24" height="22" rx="4" fill="#FF318C" />
        <rect x="9" y="20" width="9" height="2.5" fill="#FFFFFF" />
        <text x="16" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900">JB</text>
      </svg>
    ),
  },
  ilovepdf: {
    bg: 'bg-[#2B080A]',
    accent: 'border-[#E5322D]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#E5322D" d="M16 26S6 19.6 6 12.5C6 9 8.7 6.5 12 6.5c2 0 3.3 1 4 2.2.7-1.2 2-2.2 4-2.2 3.3 0 6 2.5 6 6 0 7.1-10 13.5-10 13.5z" />
        <text x="16" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900">PDF</text>
      </svg>
    ),
  },
  grammarly: {
    bg: 'bg-[#07291E]',
    accent: 'border-[#15C39A]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#15C39A" />
        <path d="M21 15h-5v2.5h3a4 4 0 1 1-1.2-4.5" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  quillbot: {
    bg: 'bg-[#082B19]',
    accent: 'border-[#499557]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#22C55E" />
        <path fill="#FFFFFF" d="M12 10h8v8l-4 4-4-4v-8z" />
      </svg>
    ),
  },
  envato: {
    bg: 'bg-[#172B08]',
    accent: 'border-[#82B541]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#82B541" d="M23 6c-7 0-13 5.5-13 12.5C10 23 13 26 17 26c5 0 8-4.5 8-12 0-4.5-.8-8-2-8z" />
      </svg>
    ),
  },
  museai: {
    bg: 'bg-[#290B36]',
    accent: 'border-[#C084FC]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="#9333EA" />
        <text x="16" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900">M</text>
      </svg>
    ),
  },
  bolt: {
    bg: 'bg-[#0A1933]',
    accent: 'border-[#38BDF8]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <path fill="#38BDF8" d="M18 4L8 18h7l-2 10 11-14h-7l1-10z" />
      </svg>
    ),
  },
  outlook: {
    bg: 'bg-[#091E3A]',
    accent: 'border-[#0078D4]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="5" y="7" width="22" height="18" rx="3" fill="#0078D4" />
        <path fill="none" stroke="#FFFFFF" strokeWidth="2.2" d="M6 9l10 7 10-7" />
      </svg>
    ),
  },
  proxy: {
    bg: 'bg-[#121622]',
    accent: 'border-[#34D399]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="none" stroke="#34D399" strokeWidth="2.4" />
        <path d="M6 16h20M16 6a14 14 0 0 1 0 20M16 6a14 14 0 0 0 0 20" fill="none" stroke="#34D399" strokeWidth="1.8" />
      </svg>
    ),
  },
  thyrocare: {
    bg: 'bg-[#290814]',
    accent: 'border-[#F43F5E]/50',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="5" y="5" width="22" height="22" rx="6" fill="#F43F5E" />
        <path fill="#FFFFFF" d="M14 9h4v5h5v4h-5v5h-4v-5H9v-4h5V9z" />
      </svg>
    ),
  },
  ottcombo: {
    bg: 'bg-[#2B0609]',
    accent: 'border-[#E50914]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="4" y="4" width="10" height="10" rx="2" fill="#E50914" />
        <rect x="18" y="4" width="10" height="10" rx="2" fill="#00A8E1" />
        <rect x="4" y="18" width="10" height="10" rx="2" fill="#1DB954" />
        <rect x="18" y="18" width="10" height="10" rx="2" fill="#F59E0B" />
      </svg>
    ),
  },
  ottbusiness: {
    bg: 'bg-[#241605]',
    accent: 'border-[#F59E0B]/55',
    renderLogo: () => (
      <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
        <rect x="5" y="9" width="22" height="17" rx="3" fill="#F59E0B" />
        <path fill="#111114" d="M11 6h10v3h-2V8h-6v1h-2V6z" />
      </svg>
    ),
  },
};

export const ServiceBrandMark: React.FC<{
  brandKey: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ brandKey, name, size = 'md' }) => {
  const key = (brandKey || '').toLowerCase();
  const visual = BRAND_VISUALS[key];

  const sizeClass =
    size === 'sm'
      ? 'h-9 w-9 rounded-lg'
      : size === 'lg'
        ? 'h-14 w-14 rounded-xl'
        : 'h-11 w-11 rounded-xl';

  if (visual) {
    return (
      <div
        className={`${sizeClass} ${visual.bg} ${visual.accent} border flex items-center justify-center shrink-0 select-none shadow-md`}
        aria-hidden="true"
      >
        {visual.renderLogo()}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} bg-[#18181D] text-[#E50914] border border-white/15 font-display font-bold text-xs flex items-center justify-center shrink-0 tracking-tight select-none shadow-md`}
      aria-hidden="true"
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};
