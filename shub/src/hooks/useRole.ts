import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { userProfile, refetchProfile } = useAuth();
  const [currentRole, setCurrentRole] = useState<'host' | 'client'>('client');
  const [isToggling, setIsToggling] = useState(false);

  // Initialize current role based on user profile
  useEffect(() => {
    if (userProfile) {
      if (userProfile.type === 'host') {
        // Hosts can toggle - use their currentRole or default to 'host'
        setCurrentRole(userProfile.currentRole || 'host');
      } else {
        // Clients always stay as clients
        setCurrentRole('client');
      }
    }
  }, [userProfile]);

  // Only hosts can toggle roles
  const canToggleRoles = userProfile?.type === 'host';

  // Switch between roles (only works for hosts)
  const switchRole = async (newRole: 'host' | 'client'): Promise<boolean> => {
    if (!userProfile || userProfile.type !== 'host') return false;

    try {
      setIsToggling(true);

      const { error } = await supabase
        .from('users')
        .update({ current_role: newRole })
        .eq('id', userProfile.id);

      if (error) throw error;

      setCurrentRole(newRole);

      // Refetch profile to ensure consistency
      await refetchProfile();

      return true;
    } catch (error) {
      console.error('Error switching role:', error);
      return false;
    } finally {
      setIsToggling(false);
    }
  };

  // Get effective user type for UI logic
  const getEffectiveUserType = (): 'host' | 'client' | null => {
    if (!userProfile) return null;

    if (userProfile.type === 'host') {
      return currentRole; // Hosts can view as either host or client
    }

    return userProfile.type; // Clients stay as clients
  };

  return {
    currentRole,
    canToggleRoles,
    isToggling,
    switchRole,
    getEffectiveUserType,
  };
};