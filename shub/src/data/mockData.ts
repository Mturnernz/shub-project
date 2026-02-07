import { Service, User } from '../types';

export const mockWorkers: User[] = [
  {
    id: '1',
    name: 'Sophia Clarke',
    email: 'sophia@example.com',
    role: 'worker',
    avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Auckland',
    verified: true
  },
  {
    id: '2',
    name: 'Isabella Rose',
    email: 'isabella@example.com',
    role: 'worker',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Wellington',
    verified: true
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    role: 'worker',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Christchurch',
    verified: true
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    workerId: '1',
    workerName: 'Sophia Clarke',
    workerAvatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Premium Companionship',
    description: 'Professional companion services for social events, dinners, and private occasions. Discreet and sophisticated.',
    price: 300,
    duration: 120,
    category: 'Companionship',
    location: 'Auckland',
    images: [
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    verified: true,
    rating: 4.9,
    reviewCount: 47,
    available: true
  },
  {
    id: '2',
    workerId: '2',
    workerName: 'Isabella Rose',
    workerAvatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Elite Evening Services',
    description: 'Sophisticated evening companionship with a focus on creating memorable experiences. Available for outcalls.',
    price: 450,
    duration: 180,
    category: 'Evening Services',
    location: 'Wellington',
    images: [
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    verified: true,
    rating: 4.8,
    reviewCount: 32,
    available: true
  },
  {
    id: '3',
    workerId: '3',
    workerName: 'Emma Davis',
    workerAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Relaxation & Wellness',
    description: 'Professional therapeutic services focusing on relaxation and wellness. Private studio available.',
    price: 250,
    duration: 90,
    category: 'Wellness',
    location: 'Christchurch',
    images: [
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    verified: true,
    rating: 4.7,
    reviewCount: 28,
    available: true
  }
];

export const categories = [
  'All',
  'Companionship',
  'Evening Services',
  'Wellness',
  'Social Events',
  'Travel Companion'
];

export const locations = [
  'All Locations',
  'Auckland',
  'Auckland - Central',
  'Auckland - North Shore',
  'Auckland - West',
  'Auckland - South',
  'Auckland - East',
  'Wellington',
  'Christchurch',
  'Hamilton',
  'Tauranga',
  'Dunedin'
];

export const aucklandSuburbs: Record<string, string[]> = {
  'Auckland - Central': ['CBD', 'Ponsonby', 'Parnell', 'Newmarket', 'Grey Lynn', 'Mt Eden', 'Remuera', 'Epsom', 'Grafton', 'Freemans Bay', 'Herne Bay'],
  'Auckland - North Shore': ['Takapuna', 'Devonport', 'Milford', 'Browns Bay', 'Albany', 'Birkenhead', 'Northcote', 'Glenfield'],
  'Auckland - West': ['Henderson', 'New Lynn', 'Glen Eden', 'Titirangi', 'Te Atatu', 'Westgate', 'Massey'],
  'Auckland - South': ['Manukau', 'Papakura', 'Mangere', 'Otahuhu', 'Papatoetoe', 'Botany', 'Howick'],
  'Auckland - East': ['Mission Bay', 'St Heliers', 'Kohimarama', 'Pakuranga', 'Half Moon Bay', 'Howick'],
};

export const aucklandLocations = ['Auckland', 'Auckland - Central', 'Auckland - North Shore', 'Auckland - West', 'Auckland - South', 'Auckland - East'];
