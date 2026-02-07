import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { userProfile, refetchProfile } = useAuth();
  const [currentRole, setCurrentRole] = useState<'worker' | 'client'>('client');
  const [isToggling, setIsToggling] = useState(false);

  // Initialize current role based on user profile
  useEffect(() => {
    if (userProfile) {
      if (userProfile.role === 'worker') {
        // Workers can toggle - use their currentRole or default to 'worker'
        setCurrentRole(userProfile.currentRole || 'worker');
      } else {
        // Clients always stay as clients
        setCurrentRole('client');
      }
    }
  }, [userProfile]);

  // Only workers can toggle roles
  const canToggleRoles = userProfile?.role === 'worker';

  // Switch between roles (only works for workers)
  const switchRole = async (newRole: 'worker' | 'client'): Promise<boolean> => {
    if (!userProfile || userProfile.role !== 'worker') return false;

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
  const getEffectiveUserType = (): 'worker' | 'client' | null => {
    if (!userProfile) return null;

    if (userProfile.role === 'worker') {
      return currentRole; // Workers can view as either worker or client
    }

    return userProfile.role; // Clients stay as clients
  };

  return {
    currentRole,
    canToggleRoles,
    isToggling,
    switchRole,
    getEffectiveUserType,
  };
};
