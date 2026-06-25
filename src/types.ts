export interface CalendarDay {
  dayNumber: number;
  dayName: string;
  topic: string;
  contentType: 'Post' | 'Reel' | 'Story' | 'Carousel' | 'Threads' | 'Video';
  bestPostingTime: string;
  captionIdea: string;
  suggestedHashtags: string[];
  visualPrompt: string;
  keyObjective: string;
}

export interface ContentCalendar {
  niche: string;
  targetAudience: string;
  tone: string;
  platform: string;
  goal: string;
  days: CalendarDay[];
  generalStrategy: string;
  weeklyHashtagPool: string[];
}

export interface GenerationRequest {
  niche: string;
  targetAudience?: string;
  tone?: string;
  platform?: string;
  goal?: string;
}

export interface RefineRequest {
  calendar: ContentCalendar;
  instruction: string;
}
