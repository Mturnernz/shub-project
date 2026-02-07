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
      { key: 'name', label: 'Name', value: userProfile.name },
      { key: 'bio', label: 'Bio', value: userProfile.bio },
      { key: 'location', label: 'Location', value: userProfile.location },
      { key: 'profilePhotos', label: 'Profile Photos (min 3)', value: userProfile.profilePhotos?.length >= 3 },
      { key: 'serviceAreas', label: 'Service Areas', value: userProfile.serviceAreas?.length > 0 },
      { key: 'languages', label: 'Languages', value: userProfile.languages?.length > 0 },
    ];

    const completedFields: string[] = [];
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      const isCompleted = field.value && (
        typeof field.value === 'string' ? field.value.trim().length > 0 :
        typeof field.value === 'boolean' ? field.value :
        Array.isArray(field.value) ? field.value.length > 0 : false
      );

      if (isCompleted) {
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