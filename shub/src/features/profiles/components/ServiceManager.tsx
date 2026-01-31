import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Service } from '../../../types';
import { categories } from '../../../data/mockData';

interface ServiceManagerProps {
  hostId: string;
  hostName: string;
  hostAvatar?: string;
}

interface ServiceForm {
  id?: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  tags: string;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ hostId, hostName, hostAvatar }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ServiceForm>({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: categories[1], // Skip 'All' option
    tags: '',
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedServices = (data || []).map(service => ({
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
        available: service.available,
      }));

      setServices(transformedServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [hostId]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      price: '',
      duration: '',
      category: categories[1],
      tags: '',
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      tags: service.tags?.join(', ') || '',
    });
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return false;
    }
    
    const price = parseFloat(form.price);
    const duration = parseInt(form.duration);
    
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    
    if (isNaN(duration) || duration <= 0) {
      setError('Please enter a valid duration in minutes');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError(null);

      const serviceData = {
        host_id: hostId,
        host_name: hostName,
        host_avatar: hostAvatar,
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        duration: parseInt(form.duration),
        category: form.category,
        location: 'Auckland', // Default location - could be made dynamic
        images: [], // Could be extended to support service images
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        verified: false,
        rating: 0,
        review_count: 0,
        available: true,
      };

      if (editingService) {
        const { error: updateError } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('services')
          .insert([serviceData]);

        if (insertError) throw insertError;
      }

      await fetchServices();
      resetForm();
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (deleteError) throw deleteError;
      
      await fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Service Listings</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Service Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Premium Companionship"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your service in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price (NZD)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="150"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="120"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="professional, premium, outcall"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No services yet</p>
            <p className="text-sm">Create your first service listing to get started</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{service.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {service.price}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration}min
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                      {service.category}
                    </span>
                  </div>
                  
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {service.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceManager;