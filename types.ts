export type ToolId = 'infographic' | 'video' | 'news';

export type TextInputObject = { summary: string; analysis: string };

export interface InfographicSlide {
  title: string;
  points: string[];
  imagePrompt: string;
  iconSuggestion: string;
  image?: string; // base64 string
}

export interface InfographicData {
  mainTitle: string;
  slides: InfographicSlide[];
  keywords: string[];
  facebookPost: string;
}

export interface VideoScriptData {
  hook: string;
  scenes: {
    scene: number;
    dialogue: string;
    visualSuggestion: string;
  }[];
  cta: string;
}

export interface NewsAnalysisData {
    summary: string;
    talkingPoints: {
        point: string;
        elaboration: string;
    }[];
    suggestedTitle: string;
}


export type TemplateId = 'classic' | 'modern' | 'bold' | 'minimalist';

export interface ColorPalette {
  name: string;
  bg: string;
  primary: string;
  secondary: string;
  text: string;
}

export interface BrandProfileData {
    brandVoice: string;
    targetAudience: string;
    customInstructions: string;
}

export type ImageStyleId = 'default' | 'vector' | 'clay' | 'watercolor';

export interface ContentAtom {
    sourceText: string;
    analysis: NewsAnalysisData;
}