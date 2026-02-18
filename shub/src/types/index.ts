export interface User {
  id: string;
  name: string;
  email: string;
  role: 'worker' | 'client';
  currentRole?: 'worker' | 'client'; // Active view mode for workers (workers can view as client)
  avatar?: string;
  location?: string;
  verified?: boolean;
  isPublished?: boolean;
  bio?: string;
  hourlyRateText?: string;
  profilePhotos?: string[];
  photoSettings?: Record<string, { blur: boolean; watermark: boolean }>;
  status?: 'available' | 'busy' | 'away';
  statusMessage?: string;
  primaryLocation?: string;
  serviceAreas?: Array<{ city: string; radius: number }>;
  languages?: Array<{ language: string; proficiency: string }>;
  qualificationDocuments?: string[];
}

export interface Service {
  id: string;
  workerId: string;
  workerName: string;
  workerAvatar?: string;
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
  workerId: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
}
