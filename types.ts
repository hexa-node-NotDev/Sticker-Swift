export interface TenorMediaFormat {
  url: string;
  duration: number;
  preview: string;
  dims: number[];
  size: number;
}

export interface TenorMediaFormats {
  gif?: TenorMediaFormat;
  mediumgif?: TenorMediaFormat;
  tinygif?: TenorMediaFormat;
  nanogif?: TenorMediaFormat;
  mp4?: TenorMediaFormat;
}

export interface TenorResult {
  id: string;
  title: string;
  content_description: string;
  content_rating: string;
  h1_title: string;
  media_formats: TenorMediaFormats;
  bg_color: string;
  created: number;
  itemurl: string;
  url: string;
  tags: string[];
  flags: string[];
  hasaudio: boolean;
}

export interface TenorResponse {
  results: TenorResult[];
  next: string;
}

export interface PackSticker {
  id: string;
  url: string;
  source: 'tenor' | 'user';
  tenorData?: TenorResult; // Optional: Keep reference to original Tenor data
}

export interface StickerPack {
  id: string;
  name: string;
  author: string;
  stickers: PackSticker[];
}