
export interface Tour {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: 'island' | 'mainland';
  subCategory?: string;
  isAvailable: boolean;
  image: string;
  features?: string[];
  price: number;
  priceBreakdown?: {
    base: number;
    gear?: number;
    parkFee?: number;
    tax?: number;
    note?: string;
  };
}

export interface BlogLog {
  id: string;
  title: string;
  date: string;
  content: string;
  imageUrl: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
