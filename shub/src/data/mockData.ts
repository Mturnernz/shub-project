import { Service, User } from '../types';

export const mockHosts: User[] = [
  {
    id: '1',
    name: 'Sophia Clarke',
    email: 'sophia@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Auckland',
    verified: true
  },
  {
    id: '2',
    name: 'Isabella Rose',
    email: 'isabella@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Wellington',
    verified: true
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    type: 'host',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Christchurch',
    verified: true
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    hostId: '1',
    hostName: 'Sophia Clarke',
    hostAvatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
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
    hostId: '2',
    hostName: 'Isabella Rose',
    hostAvatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
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
    hostId: '3',
    hostName: 'Emma Davis',
    hostAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
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
  'Wellington',
  'Christchurch',
  'Hamilton',
  'Tauranga',
  'Dunedin'
];