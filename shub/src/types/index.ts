export interface User {
  id: string;
  name: string;
  email: string;
  type: 'host' | 'client';
  currentRole?: 'host' | 'client'; // Active view mode for hosts (hosts can view as client)
  avatar?: string;
  location?: string;
  verified?: boolean;
  isPublished?: boolean;
  bio?: string;
  profilePhotos?: string[];
  status?: 'available' | 'busy' | 'away';
  statusMessage?: string;
  primaryLocation?: string;
  serviceAreas?: Array<{ city: string; radius: number }>;
  languages?: Array<{ language: string; proficiency: string }>;
  qualificationDocuments?: string[];
}

export interface Service {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  location: string;
  images: string[];
  tags?: string[];
  verified: boolean;
  rating: number;
  reviewCount: number;
  available: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  hostId: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
}