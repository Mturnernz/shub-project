import React, { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { locations } from '../../../data/mockData';
import { showToast } from '../../../utils/toast';
import { useSavedIndicator } from '../../../hooks/useSavedIndicator';

interface ServiceArea {
  city: string;
  radius: number;
}

interface LocationServiceAreaProps {
  primaryLocation?: string;
  serviceAreas: ServiceArea[];
  onLocationUpdate: (primaryLocation: string, serviceAreas: ServiceArea[]) => void;
}

const LocationServiceArea: React.FC<LocationServiceAreaProps> = ({
  primaryLocation,
  serviceAreas,
  onLocationUpdate,
}) => {
  const [localPrimaryLocation, setLocalPrimaryLocation] = useState(primaryLocation || '');
  const [localServiceAreas, setLocalServiceAreas] = useState<ServiceArea[]>(serviceAreas);
  const [newAreaCity, setNewAreaCity] = useState('');
  const [newAreaRadius, setNewAreaRadius] = useState('20');
  const { saved: showSaved, saving: isSaving, triggerSave } = useSavedIndicator();

  const availableLocations = locations.slice(1); // Remove 'All Locations'

  const handleSave = async () => {
    await triggerSave(() => onLocationUpdate(localPrimaryLocation, localServiceAreas));
    showToast.success('Location saved');
  };

  const addServiceArea = () => {
    if (!newAreaCity.trim()) return;
    
    const radius = parseInt(newAreaRadius) || 20;
    const newArea: ServiceArea = {
      city: newAreaCity.trim(),
      radius: radius,
    };
    
    // Check if city already exists
    if (localServiceAreas.some(area => area.city.toLowerCase() === newArea.city.toLowerCase())) {
      return;
    }
    
    setLocalServiceAreas([...localServiceAreas, newArea]);
    setNewAreaCity('');
    setNewAreaRadius('20');
  };

  const removeServiceArea = (index: number) => {
    setLocalServiceAreas(localServiceAreas.filter((_, i) => i !== index));
  };

  const updateServiceAreaRadius = (index: number, radius: number) => {
    const updated = [...localServiceAreas];
    updated[index].radius = radius;
    setLocalServiceAreas(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Location & Service Areas</h3>
        {isSaving && <span className="text-sm text-trust-600">Saving...</span>}
        {showSaved && !isSaving && <span className="text-sm text-safe-600 font-medium">✓ Saved</span>}
      </div>

      {/* Primary Location */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Primary Location
        </h4>
        
        <select
          value={localPrimaryLocation}
          onChange={(e) => setLocalPrimaryLocation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500"
        >
          <option value="">Select your primary location</option>
          {availableLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        
        <p className="text-sm text-gray-500">
          This is your main location where you're primarily based.
        </p>
      </div>

      {/* Service Areas */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Service Coverage Areas</h4>
        
        {/* Add New Service Area */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Add Service Area</h5>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={newAreaCity}
                onChange={(e) => setNewAreaCity(e.target.value)}
                placeholder="Enter city or area name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={newAreaRadius}
                  onChange={(e) => setNewAreaRadius(e.target.value)}
                  placeholder="20"
                  min="5"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 text-sm"
                />
                <span className="text-xs text-gray-500 block mt-1">km radius</span>
              </div>
              
              <button
                onClick={addServiceArea}
                disabled={!newAreaCity.trim()}
                className="px-3 py-2 bg-gradient-to-r from-trust-600 to-rose-600 text-white rounded-lg hover:from-trust-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Service Areas */}
        <div className="space-y-3">
          {localServiceAreas.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No service areas added yet</p>
              <p className="text-sm">Add areas where you provide services</p>
            </div>
          ) : (
            localServiceAreas.map((area, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-trust-500 mr-2" />
                      <span className="font-medium text-gray-900">{area.city}</span>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4">
                      <label className="text-sm text-gray-600">Service radius:</label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={area.radius}
                        onChange={(e) => updateServiceAreaRadius(index, parseInt(e.target.value))}
                        className="flex-1 max-w-32"
                      />
                      <span className="text-sm font-medium text-trust-600 min-w-12">
                        {area.radius}km
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeServiceArea(index)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-trust-600 to-rose-600 text-white py-3 rounded-lg hover:from-trust-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Location Settings'}
      </button>

      {/* Guidelines */}
      <div className="bg-trust-50 rounded-lg p-4">
        <h4 className="font-medium text-trust-900 mb-2">Location Guidelines</h4>
        <ul className="text-sm text-trust-800 space-y-1">
          <li>• Set your primary location where you're based most of the time</li>
          <li>• Add service areas where you're willing to travel for appointments</li>
          <li>• Service radius determines how far you'll travel within each area</li>
          <li>• Consider travel time and costs when setting your coverage areas</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationServiceArea;