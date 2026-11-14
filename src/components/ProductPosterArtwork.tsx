import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { ServiceBrandMark } from './ServiceBrandMark';

interface PosterTheme {
  gradient: string;
  glowColor: string;
  waveColor: string;
  titleText: string;
  subtitlePill?: string;
  pillStyle?: string;
  lightCard?: boolean;
  solidColor?: string;
}

const POSTER_THEMES: Record<string, PosterTheme> = {
  netflix: {
    gradient: 'from-[#320408] via-[#120406] to-[#08080A]',
    glowColor: 'rgba(229, 9, 20, 0.55)',
    waveColor: '#E50914',
    titleText: 'NETFLIX',
    subtitlePill: '4K PREMIUM',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  prime: {
    gradient: 'from-[#062B52] via-[#041428] to-[#070B14]',
    glowColor: 'rgba(0, 168, 225, 0.55)',
    waveColor: '#00A8E1',
    titleText: 'prime video',
    subtitlePill: '4K UHD',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  primeall: {
    gradient: 'from-[#08306B] via-[#061838] to-[#070914]',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    waveColor: '#38BDF8',
    titleText: 'amazon prime',
    subtitlePill: 'All Benefits',
    pillStyle: 'bg-sky-500 text-white font-bold',
  },
  hotstar: {
    gradient: 'from-[#1D2B8A] via-[#2F1065] to-[#0A081E]',
    glowColor: 'rgba(139, 92, 246, 0.55)',
    waveColor: '#A855F7',
    titleText: 'JioHotstar',
    subtitlePill: 'Super Plan',
    pillStyle: 'bg-gradient-to-r from-blue-500 to-fuchsia-600 text-white font-bold',
  },
  hotstar4k: {
    gradient: 'from-[#172578] via-[#4C1D95] to-[#0A081E]',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    waveColor: '#EC4899',
    titleText: 'JioHotstar',
    subtitlePill: '4K PLUS',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  youtube: {
    gradient: 'from-[#5A0404] via-[#260406] to-[#0B0608]',
    glowColor: 'rgba(255, 0, 0, 0.55)',
    waveColor: '#FF0000',
    titleText: 'YouTube',
    subtitlePill: 'Premium',
    pillStyle: 'bg-red-600/90 border border-red-400/50 text-white font-bold',
  },
  zee5: {
    gradient: 'from-[#151822] via-[#100A1C] to-[#09090E]',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    waveColor: '#10B981',
    titleText: 'ZEE5',
    subtitlePill: 'HD Plan',
    pillStyle: 'bg-indigo-600 text-white font-bold',
  },
  hungama: {
    gradient: 'from-[#0D214A] via-[#0B112B] to-[#0B0714]',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    waveColor: '#06B6D4',
    titleText: 'hungama',
    subtitlePill: 'Play',
    pillStyle: 'bg-sky-500/25 border border-sky-400/40 text-sky-300 font-bold italic',
  },
  sonyliv: {
    gradient: 'from-[#1A0D38] via-[#0E081C] to-[#08080D]',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    waveColor: '#8B5CF6',
    titleText: 'SONY liv',
    subtitlePill: 'Premium',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  f1tv: {
    gradient: 'from-[#4E0608] via-[#1E0406] to-[#08080A]',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    waveColor: '#EF4444',
    titleText: 'F1TV',
    subtitlePill: 'PREMIUM',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  crunchyroll: {
    gradient: 'from-[#3B1804] via-[#190B04] to-[#0A0808]',
    glowColor: 'rgba(244, 117, 33, 0.55)',
    waveColor: '#F47521',
    titleText: 'Crunchyroll',
    subtitlePill: 'Mega Fan',
    pillStyle: 'bg-orange-500 text-white font-bold',
  },
  appletv: {
    gradient: 'from-[#0D2B54] via-[#091830] to-[#08090E]',
    glowColor: 'rgba(96, 165, 250, 0.5)',
    waveColor: '#3B82F6',
    titleText: 'tv+',
    subtitlePill: 'On Your Mail',
    pillStyle: 'bg-white/15 border border-white/30 text-white font-semibold',
  },
  mysterybox: {
    gradient: 'from-[#3A1604] via-[#1A0805] to-[#0A0708]',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    waveColor: '#F59E0B',
    titleText: 'MYSTERY BOX',
    subtitlePill: 'Flash Drop',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  hoichoi: {
    gradient: 'from-[#52050B] via-[#210408] to-[#0B0608]',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    waveColor: '#EF4444',
    titleText: 'hoichoi',
    subtitlePill: 'PREMIUM',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  chaupal: {
    gradient: 'from-[#6B21A8] via-[#581C87] to-[#3B0764]',
    glowColor: 'rgba(217, 70, 239, 0.45)',
    waveColor: '#E879F9',
    titleText: 'CHAUPAL',
    subtitlePill: 'Punjabi & Desi',
    pillStyle: 'bg-amber-300 text-zinc-950 font-black',
  },
  aha: {
    gradient: 'from-[#2A1002] via-[#120904] to-[#08080A]',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    waveColor: '#F97316',
    titleText: 'aha',
    subtitlePill: 'GOLD',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  fancode: {
    gradient: 'from-[#2A0E04] via-[#140805] to-[#08080A]',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    waveColor: '#FB923C',
    titleText: 'FANCODE',
    subtitlePill: 'Live Sports',
    pillStyle: 'bg-orange-500 text-white font-bold',
  },
  curiosity: {
    gradient: 'from-[#2E210C] via-[#141008] to-[#08080A]',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    waveColor: '#FBBF24',
    titleText: 'Curiosity',
    subtitlePill: 'STREAM 4K',
    pillStyle: 'bg-amber-400 text-zinc-950 font-bold',
  },
  sunnxt: {
    gradient: 'from-[#E11D48] via-[#BE123C] to-[#881337]',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    waveColor: '#FB7185',
    titleText: 'SUN NXT',
    subtitlePill: 'South Movies',
    pillStyle: 'bg-white/20 text-white font-bold',
  },
  lionsgate: {
    gradient: 'from-[#0D2E33] via-[#09181C] to-[#07080A]',
    glowColor: 'rgba(45, 212, 191, 0.45)',
    waveColor: '#22D3EE',
    titleText: 'LIONSGATE PLAY',
    subtitlePill: 'Hollywood',
    pillStyle: 'bg-cyan-400 text-zinc-950 font-black',
  },
  shemaroo: {
    gradient: 'from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]',
    glowColor: 'rgba(236, 72, 153, 0.2)',
    waveColor: '#EC4899',
    titleText: 'shemaroo',
    subtitlePill: 'Me',
    pillStyle: 'bg-pink-600 text-white font-bold',
    lightCard: true,
  },
  applemusic: {
    gradient: 'from-[#5A0A28] via-[#260613] to-[#09080D]',
    glowColor: 'rgba(250, 45, 72, 0.55)',
    waveColor: '#FA2D48',
    titleText: 'Music',
    subtitlePill: 'On Your Mail',
    pillStyle: 'bg-white/15 border border-white/30 text-white font-semibold',
  },
  tidal: {
    gradient: 'from-[#0A2533] via-[#07131C] to-[#07080B]',
    glowColor: 'rgba(34, 211, 238, 0.5)',
    waveColor: '#22D3EE',
    titleText: 'TIDAL',
    subtitlePill: 'PREMIUM',
    pillStyle: 'bg-cyan-400 text-zinc-950 font-black',
  },
  gaana: {
    gradient: 'from-[#59070B] via-[#260508] to-[#0A0708]',
    glowColor: 'rgba(231, 44, 48, 0.55)',
    waveColor: '#E72C30',
    titleText: 'gaana',
    subtitlePill: 'Plus',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  spotify: {
    gradient: 'from-[#0A381D] via-[#071D10] to-[#070908]',
    glowColor: 'rgba(29, 185, 84, 0.55)',
    waveColor: '#1DB954',
    titleText: 'Spotify',
    subtitlePill: 'Premium',
    pillStyle: 'bg-[#1DB954] text-zinc-950 font-black',
  },
  vipgroup: {
    gradient: 'from-[#422806] via-[#1C1206] to-[#090808]',
    glowColor: 'rgba(251, 191, 36, 0.55)',
    waveColor: '#FBBF24',
    titleText: 'VIP',
    subtitlePill: 'METHOD GROUP',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  lovable: {
    gradient: 'from-[#3B1764] via-[#1F0B3B] to-[#0A0812]',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    waveColor: '#EC4899',
    titleText: 'Lovable',
    subtitlePill: 'Pro',
    pillStyle: 'bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold',
  },
  chatgpt: {
    gradient: 'from-[#06382C] via-[#061A16] to-[#07080A]',
    glowColor: 'rgba(16, 163, 127, 0.55)',
    waveColor: '#10A37F',
    titleText: 'ChatGPT',
    subtitlePill: 'Plus',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  grok: {
    gradient: 'from-[#3A1406] via-[#180A06] to-[#08080A]',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    waveColor: '#F97316',
    titleText: 'Grok',
    subtitlePill: 'Plus',
    pillStyle: 'bg-orange-500 text-white font-black',
  },
  picsart: {
    gradient: 'from-[#3A0C6E] via-[#1C0838] to-[#0A0812]',
    glowColor: 'rgba(217, 70, 239, 0.55)',
    waveColor: '#D946EF',
    titleText: 'Picsart',
    subtitlePill: 'Pro',
    pillStyle: 'bg-cyan-400 text-zinc-950 font-black',
  },
  perplexity: {
    gradient: 'from-[#08303B] via-[#06181F] to-[#07090D]',
    glowColor: 'rgba(34, 211, 238, 0.5)',
    waveColor: '#22D3EE',
    titleText: 'perplexity',
    subtitlePill: 'Pro',
    pillStyle: 'bg-teal-400 text-zinc-950 font-black',
  },
  gemini: {
    gradient: 'from-[#1C1B59] via-[#110D38] to-[#080814]',
    glowColor: 'rgba(96, 165, 250, 0.55)',
    waveColor: '#60A5FA',
    titleText: 'Gemini AI',
    subtitlePill: 'Plus',
    pillStyle: 'bg-blue-500 text-white font-bold',
  },
  claude500: {
    gradient: 'from-[#4D1E0A] via-[#210E07] to-[#09080A]',
    glowColor: 'rgba(251, 146, 60, 0.55)',
    waveColor: '#FB923C',
    titleText: 'Claude API',
    subtitlePill: '$500 Credits',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  claude100: {
    gradient: 'from-[#451A09] via-[#1E0C06] to-[#09080A]',
    glowColor: 'rgba(249, 115, 22, 0.55)',
    waveColor: '#F97316',
    titleText: 'Claude API',
    subtitlePill: '$100 Credits',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  claude: {
    gradient: 'from-[#451D0D] via-[#200E07] to-[#09080A]',
    glowColor: 'rgba(217, 119, 87, 0.55)',
    waveColor: '#D97757',
    titleText: 'Claude',
    subtitlePill: 'Pro Plan',
    pillStyle: 'bg-orange-400 text-zinc-950 font-black',
  },
  gamma: {
    gradient: 'from-[#092C78] via-[#07163E] to-[#070914]',
    glowColor: 'rgba(59, 130, 246, 0.55)',
    waveColor: '#3B82F6',
    titleText: 'Gamma',
    subtitlePill: '10K Credits',
    pillStyle: 'bg-sky-500 text-white font-bold',
  },
  kling: {
    gradient: 'from-[#073242] via-[#061822] to-[#07090C]',
    glowColor: 'rgba(45, 212, 191, 0.55)',
    waveColor: '#2DD4BF',
    titleText: 'Kling AI',
    subtitlePill: 'API 50K',
    pillStyle: 'bg-emerald-400 text-zinc-950 font-black',
  },
  canva: {
    gradient: 'from-[#00C4CC] via-[#3B82F6] to-[#7C3AED]',
    glowColor: 'rgba(0, 196, 204, 0.5)',
    waveColor: '#FFFFFF',
    titleText: 'Canva',
    subtitlePill: 'Pro',
    pillStyle: 'bg-white/25 text-white font-bold',
  },
  googleone: {
    gradient: 'from-[#171B26] via-[#0E1016] to-[#08080B]',
    glowColor: 'rgba(66, 133, 244, 0.45)',
    waveColor: '#4285F4',
    titleText: 'Google One',
    subtitlePill: '2TB Cloud',
    pillStyle: 'bg-blue-500 text-white font-bold',
  },
  linkedin: {
    gradient: 'from-[#0A66C2] via-[#08529E] to-[#063B73]',
    glowColor: 'rgba(10, 102, 194, 0.5)',
    waveColor: '#38BDF8',
    titleText: 'LinkedIn',
    subtitlePill: 'Career',
    pillStyle: 'bg-white/20 text-white font-bold',
  },
  linkedinbiz: {
    gradient: 'from-[#0A66C2] via-[#084B91] to-[#053366]',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    waveColor: '#7DD3FC',
    titleText: 'LinkedIn',
    subtitlePill: 'Business',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  capcut: {
    gradient: 'from-[#0B2336] via-[#09121E] to-[#08080D]',
    glowColor: 'rgba(34, 211, 238, 0.45)',
    waveColor: '#22D3EE',
    titleText: 'CapCut',
    subtitlePill: 'Pro',
    pillStyle: 'bg-purple-500 text-white font-bold',
  },
  adobe: {
    gradient: 'from-[#36081E] via-[#18071E] to-[#090812]',
    glowColor: 'rgba(250, 15, 0, 0.5)',
    waveColor: '#FA0F00',
    titleText: 'Creative Cloud',
    subtitlePill: 'All Apps',
    pillStyle: 'bg-red-600 text-white font-bold',
  },
  microsoft365: {
    gradient: 'from-[#FFFFFF] via-[#F8FAFC] to-[#E2E8F0]',
    glowColor: 'rgba(242, 80, 34, 0.2)',
    waveColor: '#F25022',
    titleText: 'Office 365',
    subtitlePill: '1TB Cloud',
    pillStyle: 'bg-orange-600 text-white font-bold',
    lightCard: true,
  },
  duolingo: {
    gradient: 'from-[#166534] via-[#14532D] to-[#052E16]',
    glowColor: 'rgba(88, 204, 2, 0.5)',
    waveColor: '#58CC02',
    titleText: 'duolingo',
    subtitlePill: 'Super',
    pillStyle: 'bg-[#58CC02] text-zinc-950 font-black',
  },
  netmeds: {
    gradient: 'from-[#14B8A6] via-[#0D9488] to-[#0F766E]',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    waveColor: '#FFFFFF',
    titleText: 'netmeds',
    subtitlePill: 'First Pass',
    pillStyle: 'bg-white/20 text-white font-bold',
  },
  swiggy: {
    gradient: 'from-[#FC8019] via-[#EA580C] to-[#C2410C]',
    glowColor: 'rgba(252, 128, 25, 0.45)',
    waveColor: '#FFFFFF',
    titleText: 'SWIGGY',
    subtitlePill: 'Discount Pass',
    pillStyle: 'bg-zinc-950/30 text-white font-bold',
  },
  nordvpn: {
    gradient: 'from-[#0B1E47] via-[#09132B] to-[#07090F]',
    glowColor: 'rgba(70, 135, 255, 0.5)',
    waveColor: '#4687FF',
    titleText: 'NordVPN',
    subtitlePill: 'Premium',
    pillStyle: 'bg-blue-500 text-white font-bold',
  },
  surfshark: {
    gradient: 'from-[#07363B] via-[#061D22] to-[#07090C]',
    glowColor: 'rgba(30, 202, 211, 0.5)',
    waveColor: '#1ECAD3',
    titleText: 'Surfshark',
    subtitlePill: 'VPN Unlimited',
    pillStyle: 'bg-cyan-400 text-zinc-950 font-black',
  },
  discovery: {
    gradient: 'from-[#0B2D63] via-[#071836] to-[#070912]',
    glowColor: 'rgba(0, 116, 232, 0.55)',
    waveColor: '#0074E8',
    titleText: 'discovery+',
    subtitlePill: '4K Docu & Live',
    pillStyle: 'bg-blue-500 text-white font-bold',
  },
  mubi: {
    gradient: 'from-[#17174A] via-[#0C0C24] to-[#07070E]',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    waveColor: '#818CF8',
    titleText: 'MUBI',
    subtitlePill: 'Cinema Curated',
    pillStyle: 'bg-indigo-500 text-white font-bold',
  },
  coursera: {
    gradient: 'from-[#082E6E] via-[#07193B] to-[#070914]',
    glowColor: 'rgba(0, 86, 210, 0.55)',
    waveColor: '#0056D2',
    titleText: 'Coursera',
    subtitlePill: 'Plus 10K+ Courses',
    pillStyle: 'bg-blue-600 text-white font-bold',
  },
  udemy: {
    gradient: 'from-[#3A1466] via-[#1C0A33] to-[#09070F]',
    glowColor: 'rgba(164, 53, 240, 0.55)',
    waveColor: '#A435F0',
    titleText: 'Udemy',
    subtitlePill: 'Personal Plan',
    pillStyle: 'bg-purple-500 text-white font-bold',
  },
  scribd: {
    gradient: 'from-[#0D3842] via-[#081F26] to-[#070A0D]',
    glowColor: 'rgba(30, 123, 133, 0.5)',
    waveColor: '#2DD4BF',
    titleText: 'SCRIBD',
    subtitlePill: 'eBooks & Audio',
    pillStyle: 'bg-teal-500 text-zinc-950 font-black',
  },
  skillshare: {
    gradient: 'from-[#073B2A] via-[#061F17] to-[#070A09]',
    glowColor: 'rgba(0, 255, 132, 0.45)',
    waveColor: '#00FF84',
    titleText: 'SkillShare',
    subtitlePill: 'Premium',
    pillStyle: 'bg-[#00FF84] text-zinc-950 font-black',
  },
  edx: {
    gradient: 'from-[#470B20] via-[#210712] to-[#09070A]',
    glowColor: 'rgba(210, 50, 40, 0.5)',
    waveColor: '#D23228',
    titleText: 'edX',
    subtitlePill: 'Verified Learning',
    pillStyle: 'bg-rose-600 text-white font-bold',
  },
  notion: {
    gradient: 'from-[#222228] via-[#121216] to-[#08080A]',
    glowColor: 'rgba(255, 255, 255, 0.25)',
    waveColor: '#E4E4E7',
    titleText: 'Notion',
    subtitlePill: 'Plus Edu',
    pillStyle: 'bg-white text-zinc-950 font-black',
  },
  figma: {
    gradient: 'from-[#2D184D] via-[#170C29] to-[#09070D]',
    glowColor: 'rgba(162, 89, 255, 0.5)',
    waveColor: '#A259FF',
    titleText: 'Figma',
    subtitlePill: 'Pro Edu',
    pillStyle: 'bg-purple-500 text-white font-bold',
  },
  adobeexpress: {
    gradient: 'from-[#361066] via-[#190833] to-[#09070E]',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    waveColor: '#A855F7',
    titleText: 'Adobe Express',
    subtitlePill: '12 Months',
    pillStyle: 'bg-violet-500 text-white font-bold',
  },
  autodesk: {
    gradient: 'from-[#09362C] via-[#061C17] to-[#070A09]',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    waveColor: '#10B981',
    titleText: 'AUTODESK',
    subtitlePill: 'All Apps 1Y',
    pillStyle: 'bg-emerald-400 text-zinc-950 font-black',
  },
  jetbrains: {
    gradient: 'from-[#4A0D4F] via-[#220726] to-[#09070C]',
    glowColor: 'rgba(255, 49, 140, 0.5)',
    waveColor: '#FF318C',
    titleText: 'JetBrains',
    subtitlePill: '18 IDEs Pack',
    pillStyle: 'bg-pink-500 text-white font-bold',
  },
  ilovepdf: {
    gradient: 'from-[#520A0E] via-[#240608] to-[#090708]',
    glowColor: 'rgba(229, 50, 45, 0.55)',
    waveColor: '#E5322D',
    titleText: 'iLovePDF',
    subtitlePill: 'Pro + 2K AI',
    pillStyle: 'bg-red-600 text-white font-bold',
  },
  grammarly: {
    gradient: 'from-[#073B2A] via-[#061F17] to-[#070A09]',
    glowColor: 'rgba(21, 195, 154, 0.5)',
    waveColor: '#15C39A',
    titleText: 'Grammarly',
    subtitlePill: 'Premium AI',
    pillStyle: 'bg-emerald-400 text-zinc-950 font-black',
  },
  quillbot: {
    gradient: 'from-[#0B3D1F] via-[#061E10] to-[#070A08]',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    waveColor: '#22C55E',
    titleText: 'QuillBot',
    subtitlePill: 'Premium',
    pillStyle: 'bg-green-500 text-zinc-950 font-black',
  },
  envato: {
    gradient: 'from-[#243D0A] via-[#111E06] to-[#080907]',
    glowColor: 'rgba(130, 181, 65, 0.5)',
    waveColor: '#82B541',
    titleText: 'envato',
    subtitlePill: 'Elements',
    pillStyle: 'bg-[#82B541] text-zinc-950 font-black',
  },
  museai: {
    gradient: 'from-[#3F0E59] via-[#1C0729] to-[#09070D]',
    glowColor: 'rgba(192, 132, 252, 0.5)',
    waveColor: '#C084FC',
    titleText: 'Muse AI',
    subtitlePill: '1B Tokens',
    pillStyle: 'bg-purple-500 text-white font-bold',
  },
  bolt: {
    gradient: 'from-[#0B2654] via-[#07132B] to-[#07090F]',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    waveColor: '#38BDF8',
    titleText: 'Bolt.new',
    subtitlePill: 'Pro 10M Tokens',
    pillStyle: 'bg-sky-400 text-zinc-950 font-black',
  },
  outlook: {
    gradient: 'from-[#092C59] via-[#06152B] to-[#07090E]',
    glowColor: 'rgba(0, 120, 212, 0.5)',
    waveColor: '#0078D4',
    titleText: 'Outlook',
    subtitlePill: 'Verified Mail',
    pillStyle: 'bg-blue-500 text-white font-bold',
  },
  proxy: {
    gradient: 'from-[#0C2E24] via-[#081716] to-[#07080A]',
    glowColor: 'rgba(52, 211, 153, 0.45)',
    waveColor: '#34D399',
    titleText: 'Rotating Proxy',
    subtitlePill: '99.9% Uptime',
    pillStyle: 'bg-emerald-400 text-zinc-950 font-black',
  },
  thyrocare: {
    gradient: 'from-[#4A0B20] via-[#210610] to-[#090709]',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    waveColor: '#F43F5E',
    titleText: 'Thyrocare',
    subtitlePill: '90+ Lab Tests',
    pillStyle: 'bg-rose-500 text-white font-bold',
  },
  ottcombo: {
    gradient: 'from-[#4F070C] via-[#1C0714] to-[#08080D]',
    glowColor: 'rgba(229, 9, 20, 0.55)',
    waveColor: '#E50914',
    titleText: '4-OTT COMBO',
    subtitlePill: 'Bundle Builder',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
  ottbusiness: {
    gradient: 'from-[#4A2B05] via-[#1D1206] to-[#090808]',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    waveColor: '#F59E0B',
    titleText: 'OTT BUSINESS',
    subtitlePill: 'Reseller Kit',
    pillStyle: 'bg-amber-400 text-zinc-950 font-black',
  },
};

export const ProductPosterArtwork: React.FC<{
  brandKey: string;
  name: string;
  imageUrl?: string;
  discountPercent?: number;
  compact?: boolean;
}> = ({ brandKey, name, imageUrl, discountPercent, compact = false }) => {
  const isCustomUploadedImage =
    Boolean(imageUrl) && !imageUrl!.startsWith('preset:') && (imageUrl!.startsWith('data:') || imageUrl!.startsWith('http'));

  const key = (brandKey || 'custom').toLowerCase();
  const theme = POSTER_THEMES[key] || {
    gradient: 'from-[#2A060B] via-[#121216] to-[#08080A]',
    glowColor: 'rgba(229, 9, 20, 0.45)',
    waveColor: '#E50914',
    titleText: name.split(' ').slice(0, 2).join(' '),
    subtitlePill: 'Verified',
    pillStyle: 'bg-[#E50914] text-white font-bold',
  };

  if (isCustomUploadedImage) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#0A0A0D]">
        <img
          src={imageUrl}
          alt={`${name} cover`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discountPercent && discountPercent > 0 ? (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold bg-[#141418]/90 text-white border border-white/15 rounded-md">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center p-4 select-none`}
    >
      {/* Ambient Radial Spotlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${theme.glowColor}, transparent 72%)`,
        }}
        aria-hidden="true"
      />

      {/* Glowing Curve Ribbon matching subsplit.in app tiles */}
      <svg
        viewBox="0 0 240 120"
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-55"
        aria-hidden="true"
      >
        <path
          d="M-10 95 C 55 55, 165 115, 250 65"
          fill="none"
          stroke={theme.waveColor}
          strokeWidth="3.5"
        />
        <path
          d="M-10 108 C 75 78, 170 125, 250 82"
          fill="none"
          stroke={theme.waveColor}
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
      </svg>

      {/* Top-Left Discount Pill */}
      {discountPercent && discountPercent > 0 ? (
        <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] font-bold bg-[#09090D]/85 text-white border border-white/15 rounded-md backdrop-blur-sm">
          {discountPercent}% OFF
        </span>
      ) : null}

      {/* Brand Emblem + Wordmark + Pill Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2 transition-transform duration-500 group-hover:scale-105">
        <div className={compact ? 'scale-95' : 'scale-125'}>
          <ServiceBrandMark brandKey={brandKey} name={name} size="md" />
        </div>

        <p
          className={`font-display font-black tracking-tight leading-none ${
            compact ? 'text-base' : 'text-lg sm:text-xl'
          } ${theme.lightCard ? 'text-zinc-900' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]'}`}
        >
          {theme.titleText}
        </p>

        {theme.subtitlePill && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] tracking-wide shadow-sm ${
              theme.pillStyle || 'bg-white/20 text-white'
            }`}
          >
            {theme.subtitlePill.includes('PREMIUM') || theme.subtitlePill.includes('GOLD') ? (
              <Crown className="w-2.5 h-2.5" aria-hidden="true" />
            ) : theme.subtitlePill.includes('Pro') || theme.subtitlePill.includes('Credits') ? (
              <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
            ) : null}
            <span>{theme.subtitlePill}</span>
          </span>
        )}
      </div>
    </div>
  );
};
