export interface PresetNiche {
  id: string;
  name: string;
  icon: string;
  suggestedAudience: string;
  suggestedTone: string;
  suggestedGoal: string;
}

export const PRESET_NICHES: PresetNiche[] = [
  {
    id: 'fitness',
    name: 'Fitness Coach',
    icon: '🏋️‍♂️',
    suggestedAudience: 'Busy working professionals wanting to stay fit',
    suggestedTone: 'Inspirational & Energetic',
    suggestedGoal: 'Drive high-quality leads for 1-on-1 coaching'
  },
  {
    id: 'bakery',
    name: 'Artisanal Bakery',
    icon: '🥐',
    suggestedAudience: 'Local foodies and pastry lovers',
    suggestedTone: 'Warm, Friendly & Mouth-watering',
    suggestedGoal: 'Boost walk-in store sales and local brand awareness'
  },
  {
    id: 'saas',
    name: 'SaaS Startup',
    icon: '🚀',
    suggestedAudience: 'Tech founders and software engineers',
    suggestedTone: 'Sleek, Professional & Informative',
    suggestedGoal: 'Increase sign-ups for free trials'
  },
  {
    id: 'fashion',
    name: 'E-commerce Fashion',
    icon: '👗',
    suggestedAudience: 'Gen-Z and Millennials interested in sustainable clothing',
    suggestedTone: 'Bold, Trendy & Authentic',
    suggestedGoal: 'Drive website sales and product engagement'
  },
  {
    id: 'realestate',
    name: 'Real Estate Agency',
    icon: '🏠',
    suggestedAudience: 'First-time homebuyers and property investors',
    suggestedTone: 'Trustworthy, Expert & Educational',
    suggestedGoal: 'Generate premium seller listings and buyer inquiries'
  }
];

export const PRESET_TONES = [
  { label: 'Informative & Expert', value: 'Informative & Expert' },
  { label: 'Humorous & Quirky', value: 'Humorous & Quirky' },
  { label: 'Inspirational & Energetic', value: 'Inspirational & Energetic' },
  { label: 'Warm, Friendly & Empathetic', value: 'Warm, Friendly & Empathetic' },
  { label: 'Sleek, Bold & Authoritative', value: 'Sleek, Bold & Authoritative' }
];

export const PRESET_GOALS = [
  { label: 'Drive website traffic & sales', value: 'Drive website traffic & sales' },
  { label: 'Generate leads / inquiries', value: 'Generate leads / inquiries' },
  { label: 'Boost audience engagement', value: 'Boost audience engagement' },
  { label: 'Establish expert authority', value: 'Establish expert authority' },
  { label: 'Build brand awareness & trust', value: 'Build brand awareness & trust' }
];

export const PLATFORMS = [
  { id: 'instagram', label: 'Instagram (Reels, Carousels, Stories)', defaultSelected: true },
  { id: 'linkedin', label: 'LinkedIn (Text, Carousels, Posts)', defaultSelected: false },
  { id: 'tiktok', label: 'TikTok (Short-form Video, Trends)', defaultSelected: false },
  { id: 'all', label: 'Cross-platform (Instagram, TikTok, LinkedIn)', defaultSelected: false }
];

export const getContentTypeBadgeStyles = (type: string) => {
  switch (type.toLowerCase()) {
    case 'reel':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'story':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'carousel':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    case 'threads':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'video':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};
