import heroDevicesImg from '../assets/images/hero_subsplit_devices_1794672598873.jpg';
import ottCinemaImg from '../assets/images/product_ott_cinema_1794675617094.jpg';
import musicAudioImg from '../assets/images/product_music_audio_1794675618279.jpg';
import aiWorkspaceImg from '../assets/images/product_ai_workspace_1794675618440.jpg';
import creativeStudioImg from '../assets/images/product_creative_studio_1794675618680.jpg';
import sportsSecurityImg from '../assets/images/product_sports_security_1794675618994.jpg';

export const HERO_BANNER_IMAGE = heroDevicesImg;

export const PRESET_PRODUCT_MEDIA: Array<{
  key: string;
  label: string;
  src: string;
}> = [
  { key: 'preset:ott-cinema', label: '4K Cinema Studio', src: ottCinemaImg },
  { key: 'preset:music-audio', label: 'Lossless Audio Studio', src: musicAudioImg },
  { key: 'preset:ai-workspace', label: 'AI & Pro Workspace', src: aiWorkspaceImg },
  { key: 'preset:creative-studio', label: 'Creative Design Desk', src: creativeStudioImg },
  { key: 'preset:sports-security', label: 'Sports & Security Suite', src: sportsSecurityImg },
];

const BRAND_MEDIA_FALLBACK: Record<string, string> = {
  netflix: ottCinemaImg,
  prime: ottCinemaImg,
  hotstar: sportsSecurityImg,
  sonyliv: sportsSecurityImg,
  zee5: ottCinemaImg,
  crunchyroll: ottCinemaImg,
  spotify: musicAudioImg,
  youtube: musicAudioImg,
  chatgpt: aiWorkspaceImg,
  claude: aiWorkspaceImg,
  linkedin: aiWorkspaceImg,
  microsoft365: aiWorkspaceImg,
  googleone: aiWorkspaceImg,
  canva: creativeStudioImg,
  adobe: creativeStudioImg,
  nordvpn: sportsSecurityImg,
};

export function resolveProductImageSrc(imageUrl?: string, brandKey?: string, category?: string): string {
  const trimmed = (imageUrl || '').trim();
  if (trimmed) {
    const preset = PRESET_PRODUCT_MEDIA.find((p) => p.key === trimmed);
    if (preset) return preset.src;
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
  }
  const bk = (brandKey || '').toLowerCase();
  if (BRAND_MEDIA_FALLBACK[bk]) {
    return BRAND_MEDIA_FALLBACK[bk];
  }
  if (category === 'Music') return musicAudioImg;
  if (category === 'AI & Tools') return aiWorkspaceImg;
  if (category === 'Productivity') return creativeStudioImg;
  if (category === 'Security') return sportsSecurityImg;
  return ottCinemaImg;
}
