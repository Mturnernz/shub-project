import { useMemo } from 'react';
import { User } from '../../../types';

interface ProfileCompletionDetails {
  percentage: number;
  missingFields: string[];
  completedFields: string[];
  isComplete: boolean;
}

export const useProfileCompletion = (userProfile: User | null): ProfileCompletionDetails => {
  return useMemo(() => {
    if (!userProfile || userProfile.role !== 'worker') {
      return {
        percentage: 0,
        missingFields: [],
        completedFields: [],
        isComplete: false,
      };
    }

    const requiredFields = [
      { key: 'bio',             label: 'Bio',                    value: (userProfile.bio?.length ?? 0) >= 100 },
      { key: 'profilePhotos',   label: 'Profile Photos (min 3)', value: (userProfile.profilePhotos?.length ?? 0) >= 3 },
      { key: 'primaryLocation', label: 'Location',               value: !!(userProfile.primaryLocation?.trim()) },
    ];

    const completedFields: string[] = [];
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      if (field.value) {
        completedFields.push(field.label);
      } else {
        missingFields.push(field.label);
      }
    });

    const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
    const isComplete = percentage === 100;

    return {
      percentage,
      missingFields,
      completedFields,
      isComplete,
    };
  }, [userProfile]);
};