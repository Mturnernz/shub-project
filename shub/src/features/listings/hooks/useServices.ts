import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Service } from '../../../types';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Get all available services with host information - call searchServices with defaults
      await searchServices('', 'All', 'All Locations', 'All', 0, '', false);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const searchServices = async (
    query: string, 
    category: string, 
    location: string, 
    availability?: string, 
    minRating?: number, 
    dateCreated?: string,
    featuredOnly?: boolean
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('Filter parameters:', {
        query,
        category,
        location,
        availability,
        minRating,
        dateCreated,
        featuredOnly
      });

      // Start with base query for services and join with users table for host info
      let supabaseQuery = supabase
        .from('services')
        .select(`
          *,
          host:users!inner (
            status,
            created_at,
            is_published
          )
        `)
        .eq('available', true)
        .eq('host.is_published', true);

      // Apply text search filter
      if (query && query.trim()) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%,host_name.ilike.%${query.trim()}%`);
      }

      // Apply category filter
      if (category && category !== 'All') {
        supabaseQuery = supabaseQuery.eq('category', category);
      }

      // Apply location filter
      if (location && location !== 'All Locations') {
        supabaseQuery = supabaseQuery.eq('location', location);
      }

      // Apply availability filter (filter by host status)
      if (availability && availability !== 'All') {
        // Map UI values to database values
        const statusMap: Record<string, string> = {
          'Available': 'available',
          'Busy': 'busy', 
          'Away': 'away'
        };
        const dbStatus = statusMap[availability] || availability.toLowerCase();
        supabaseQuery = supabaseQuery.eq('host.status', dbStatus);
      }

      // Apply minimum rating filter
      if (minRating && minRating > 0) {
        supabaseQuery = supabaseQuery.gte('rating', minRating);
      }

      // Apply date created filter (filter by when host profile was created)
      if (dateCreated) {
        supabaseQuery = supabaseQuery.gte('host.created_at', dateCreated);
      }

      // Apply featured/verified filter
      if (featuredOnly) {
        supabaseQuery = supabaseQuery.eq('verified', true);
      }

      // Order by created date descending (newest first)
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

      console.log('Executing query...');
      const { data: servicesData, error: servicesError } = await supabaseQuery;

      console.log('Query result:', { servicesData, servicesError });

      if (servicesError) {
        console.error('Supabase query error:', servicesError);
        throw servicesError;
      }

      if (!servicesData || servicesData.length === 0) {
        console.log('No services found for current filters - this is normal and expected for some filter combinations');
        setServices([]);
        return;
      }

      console.log(`Found ${servicesData.length} services`);

      const transformedServices: Service[] = servicesData.map(service => ({
        id: service.id,
        hostId: service.host_id,
        hostName: service.host_name,
        hostAvatar: service.host_avatar,
        title: service.title,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        location: service.location,
        images: service.images || [],
        tags: service.tags || [],
        verified: service.verified,
        rating: service.rating,
        reviewCount: service.review_count,
        available: service.available
      }));

      console.log('Transformed services:', transformedServices.map(s => ({ title: s.title, host: s.hostName, category: s.category, location: s.location })));
      setServices(transformedServices);
    } catch (err) {
      console.error('Error searching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to search services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    searchServices
  };
};