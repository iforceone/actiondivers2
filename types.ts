
export interface Tour {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: 'island' | 'mainland';
  subCategory?: string;
  isAvailable: boolean;
  image: string;
  duration?: string;
  departureTime?: string;
  groupSize?: string;
  meetingPickup?: string;
  includes?: string[];
  beforeYouBook?: string[];
  whatToBring?: string[];
  features?: string[];
  options?: TourOption[];
  price: number;
  priceBreakdown?: {
    base: number;
    gear?: number;
    parkFee?: number;
    tax?: number;
    note?: string;
  };
}

export interface TourOption {
  name: string;
  description: string;
  price: number;
  note?: string;
}

export interface BlogLog {
  id: string;
  title: string;
  date: string;
  content: string;
  imageUrl: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  tags: string[];
  relatedTours: string[];
  body: string[];
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export type GalleryCategory =
  | 'diving'
  | 'snorkeling'
  | 'fishing'
  | 'boating'
  | 'mainland'
  | 'dining'
  | 'nature';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  title: string;
}
