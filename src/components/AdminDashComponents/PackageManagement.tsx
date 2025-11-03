import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Edit, Trash2, Save, X, Star, StarOff, Eye, EyeOff, RefreshCw, Settings, Check, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Feature {
  feature_id: string;
  feature_name: string;
  created_at: string;
}

interface FeatureItem {
  name: string;
  available: boolean;
  hidden: boolean;
  order: number;
}

interface PackageType {
  package_id: string;
  package_name: string;
  description: string;
  duration_days: number;
  price: number;
  features: FeatureItem[];
  is_active: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

interface PackageFormData {
  package_name: string;
  description: string;
  duration_days: number;
  price: number;
  features: FeatureItem[];
  is_active: boolean;
  is_popular: boolean;
}

const PackageManagement = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<PackageFormData>({
    package_name: '',
    description: '',
    duration_days: 30,
    price: 0,
    features: [],
    is_active: true,
    is_popular: false,
  });

  useEffect(() => {
    fetchPackages();
    fetchFeatures();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('feature_name', { ascending: true });

      if (error) throw error;
      setAllFeatures(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch features',
        variant: 'destructive',
      });
    }
  };

  const addNewFeature = async () => {
    if (!newFeatureName.trim()) {
      toast({
        title: 'Error',
        description: 'Feature name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('features')
        .insert({ feature_name: newFeatureName.trim() });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feature added successfully',
      });

      setNewFeatureName('');
      fetchFeatures();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteFeature = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature? This will affect all packages using it.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('features')
        .delete()
        .eq('feature_id', featureId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feature deleted successfully',
      });

      fetchFeatures();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      package_name: '',
      description: '',
      duration_days: 30,
      price: 0,
      features: [],
      is_active: true,
      is_popular: false,
    });
    setEditingPackage(null);
  };

  const openCreateDialog = () => {
    resetForm();
    const initialFeatures = allFeatures.map((f, index) => ({
      name: f.feature_name,
      available: false,
      hidden: false,
      order: index,
    }));
    setFormData(prev => ({ ...prev, features: initialFeatures }));
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: PackageType) => {
    setEditingPackage(pkg);
    
    let packageFeatures: FeatureItem[] = [];
    
    if (pkg.features && Array.isArray(pkg.features)) {
      packageFeatures = pkg.features.map(f => {
        if (typeof f === 'string') {
          try {
            return JSON.parse(f);
          } catch (e) {
            console.error('Error parsing feature:', f, e);
            return null;
          }
        }
        return f;
      }).filter(f => f !== null) as FeatureItem[];
    }
    
    const mergedFeatures = allFeatures.map((f, index) => {
      const existingFeature = packageFeatures.find(pf => 
        pf.name?.trim().toLowerCase() === f.feature_name?.trim().toLowerCase()
      );
      
      return {
        name: f.feature_name,
        available: existingFeature?.available || false,
        hidden: existingFeature?.hidden || false,
        order: existingFeature?.order ?? index,
      };
    });

    mergedFeatures.sort((a, b) => a.order - b.order);

    setFormData({
      package_name: pkg.package_name,
      description: pkg.description,
      duration_days: pkg.duration_days,
      price: pkg.price,
      features: mergedFeatures,
      is_active: pkg.is_active,
      is_popular: pkg.is_popular,
    });
    setDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (name: 'is_active' | 'is_popular') => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleFeatureAvailability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, available: !feature.available } : feature
      ),
    }));
  };

  const toggleFeatureHidden = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, hidden: !feature.hidden } : feature
      ),
    }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    setFormData(prev => {
      const newFeatures = [...prev.features];
      const draggedItem = newFeatures[draggedIndex];
      
      newFeatures.splice(draggedIndex, 1);
      newFeatures.splice(dropIndex, 0, draggedItem);
      
      newFeatures.forEach((feature, i) => {
        feature.order = i;
      });
      
      return { ...prev, features: newFeatures };
    });
    
    setDraggedIndex(null);
  };

  const handleSubmit = async () => {
    if (!formData.package_name.trim()) {
      toast({
        title: 'Error',
        description: 'Package name is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: 'Error',
        description: 'Price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (formData.duration_days <= 0) {
      toast({
        title: 'Error',
        description: 'Duration must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update({
            package_name: formData.package_name,
            description: formData.description,
            duration_days: formData.duration_days,
            price: formData.price,
            features: formData.features,
            is_active: formData.is_active,
            is_popular: formData.is_popular,
            updated_at: new Date().toISOString(),
          })
          .eq('package_id', editingPackage.package_id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Package updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('packages')
          .insert({
            package_name: formData.package_name,
            description: formData.description,
            duration_days: formData.duration_days,
            price: formData.price,
            features: formData.features,
            is_active: formData.is_active,
            is_popular: formData.is_popular,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Package created successfully',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const togglePackageStatus = async (pkg: PackageType) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ is_active: !pkg.is_active })
        .eq('package_id', pkg.package_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Package ${!pkg.is_active ? 'activated' : 'deactivated'}`,
      });

      fetchPackages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const togglePopular = async (pkg: PackageType) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ is_popular: !pkg.is_popular })
        .eq('package_id', pkg.package_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Package ${!pkg.is_popular ? 'marked' : 'unmarked'} as popular`,
      });

      fetchPackages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('package_id', packageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Package deleted successfully',
      });

      fetchPackages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getDurationText = (days: number) => {
    if (days === 30) return '1 Month';
    if (days === 90) return '3 Months';
    if (days === 180) return '6 Months';
    if (days === 365) return '1 Year';
    return `${days} Days`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
        <Button 
          onClick={openCreateDialog} 
          className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Create Package
        </Button>
        <Button 
          onClick={() => setFeatureDialogOpen(true)} 
          className="bg-amber-200 hover:bg-amber-400 w-full sm:w-auto"
          size="sm"
          variant="outline"
        >
          <Settings size={16} className="mr-2" />
          Manage Features ({allFeatures.length})
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow">
          <RefreshCw className="animate-spin mx-auto mb-3 text-blue-500" size={28} />
          <p className="text-gray-600 text-sm">Loading packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-4 text-sm">No packages found</p>
          <Button onClick={openCreateDialog} className="bg-blue-500 hover:bg-blue-600 text-sm">
            <Plus size={16} className="mr-2" />
            Create Your First Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {packages.map((pkg) => {
            let displayFeatures: FeatureItem[] = [];
            if (pkg.features && Array.isArray(pkg.features)) {
              displayFeatures = pkg.features.map(f => {
                if (typeof f === 'string') {
                  try {
                    return JSON.parse(f);
                  } catch (e) {
                    return null;
                  }
                }
                return f;
              }).filter(f => f !== null) as FeatureItem[];
            }
            
            displayFeatures = displayFeatures
              .filter(f => !f.hidden)
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            return (
            <div
              key={pkg.package_id}
              className={`bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border-2 transition-all hover:shadow-xl ${
                pkg.is_popular ? 'border-yellow-400' : 'border-transparent'
              } ${!pkg.is_active ? 'opacity-60' : ''}`}
            >
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold flex-1 line-clamp-1">{pkg.package_name}</h3>
                  {pkg.is_popular && (
                    <Star className="text-yellow-400 fill-yellow-400 flex-shrink-0" size={18} />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{pkg.description}</p>
                <span className={`inline-block px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full ${
                  pkg.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                  ₹{pkg.price.toLocaleString('en-IN')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">{getDurationText(pkg.duration_days)}</div>
              </div>

              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Features ({displayFeatures.filter(f => f.available).length}/{displayFeatures.length}):
                </p>
                <ul className="space-y-1">
                  {displayFeatures.slice(0, 4).map((feature, index) => (
                    <li key={index} className="text-xs sm:text-sm text-gray-600 flex items-start">
                      <span className={`mr-1.5 sm:mr-2 flex-shrink-0 font-bold ${
                        feature.available ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {feature.available ? '✓' : '✗'}
                      </span>
                      <span className={`line-clamp-1 ${!feature.available ? 'line-through text-gray-400' : ''}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                  {displayFeatures.length > 4 && (
                    <li className="text-xs sm:text-sm text-gray-500 italic">
                      +{displayFeatures.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <Button
                  onClick={() => openEditDialog(pkg)}
                  size="sm"
                  variant="outline"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Edit size={12} className="sm:mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  onClick={() => togglePackageStatus(pkg)}
                  size="sm"
                  variant="outline"
                  className="w-full h-8 sm:h-9"
                  title={pkg.is_active ? 'Deactivate' : 'Activate'}
                >
                  {pkg.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                </Button>
                <Button
                  onClick={() => togglePopular(pkg)}
                  size="sm"
                  variant="outline"
                  className="w-full h-8 sm:h-9"
                  title={pkg.is_popular ? 'Remove Popular' : 'Mark Popular'}
                >
                  {pkg.is_popular ? <StarOff size={12} /> : <Star size={12} />}
                </Button>
                <Button
                  onClick={() => deletePackage(pkg.package_id)}
                  size="sm"
                  variant="destructive"
                  className="w-full h-8 sm:h-9"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Create/Edit Package Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl pr-8">
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </DialogTitle>
            <button
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Package Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="package_name"
                value={formData.package_name}
                onChange={handleInputChange}
                placeholder="e.g., Basic, Premium, Elite"
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the package"
                className="w-full border border-gray-300 rounded-lg p-2 min-h-[60px] sm:min-h-[80px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="2999"
                  min="0"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Duration (Days) <span className="text-red-500">*</span>
                </label>
                <select
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">1 Month (30 days)</option>
                  <option value="90">3 Months (90 days)</option>
                  <option value="180">6 Months (180 days)</option>
                  <option value="365">1 Year (365 days)</option>
                </select>
              </div>
            </div>

            {/* Features with Drag & Drop */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs sm:text-sm font-medium">
                  Configure Features <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {formData.features.filter(f => !f.hidden).length} visible
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-2">
                Drag to reorder, click icons to toggle availability/visibility
              </p>
              
              {formData.features.length > 0 ? (
                <div className="space-y-2 max-h-[200px] sm:max-h-[400px] overflow-y-auto p-2 ">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-lg border-2 transition-all cursor-move ${
                        draggedIndex === index ? 'opacity-50 scale-95' : ''
                      } ${
                        feature.available && !feature.hidden
                          ? 'bg-green-50 border-green-300 hover:bg-green-100'
                          : feature.available && feature.hidden
                          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <GripVertical size={16} className="text-gray-400 flex-shrink-0" />
                      
                      <span className={`flex-1 text-xs sm:text-sm ${
                        feature.hidden ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {index + 1}. {feature.name}
                      </span>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFeatureAvailability(index)}
                          className={`p-1.5 sm:p-2 rounded transition-all ${
                            feature.available
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                          title={feature.available ? 'Available (Click to disable)' : 'Not Available (Click to enable)'}
                        >
                          {feature.available ? <Check size={14} /> : <X size={14} />}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => toggleFeatureHidden(index)}
                          className={`p-1.5 sm:p-2 rounded transition-all ${
                            feature.hidden
                              ? 'bg-gray-500 text-white hover:bg-gray-600'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                          title={feature.hidden ? 'Hidden (Click to show)' : 'Visible (Click to hide)'}
                        >
                          {feature.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 border rounded-lg bg-gray-50">
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">No features available. Please add features first.</p>
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                      setFeatureDialogOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Settings size={14} className="mr-2" />
                    Manage Features
                  </Button>
                </div>
              )}
              
              <div className="mt-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-[10px] sm:text-xs text-blue-800">
                  <strong>Legend:</strong> Green = Available & Visible | Blue = Available but Hidden | Red = Not Available
                </p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-row gap-3 px-10 sm:px-20 sm:gap-4 justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={() => handleCheckboxChange('is_active')}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-xs sm:text-sm">Active</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={() => handleCheckboxChange('is_popular')}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-xs sm:text-sm">Mark as Popular</span>
              </label>
            </div>

            <div className="flex flex-row sm:flex-row gap-2 pt-2 sm:pt-4">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-sm"
                onClick={handleSubmit}
              >
                <Save size={14} className="mr-2" />
                {editingPackage ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Features Dialog */}
      <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg lg:text-xl pr-8">Manage Features</DialogTitle>
            <button
              onClick={() => setFeatureDialogOpen(false)}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Add New Feature</label>
              <div className="flex gap-2">
                <Input
                  value={newFeatureName}
                  onChange={(e) => setNewFeatureName(e.target.value)}
                  placeholder="Enter feature name"
                  className="flex-1 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNewFeature();
                    }
                  }}
                />
                <Button onClick={addNewFeature} size="sm" className="px-3">
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">
                Existing Features ({allFeatures.length})
              </label>
              {allFeatures.length > 0 ? (
                <div className="space-y-2 max-h-[200px] sm:max-h-[250px] overflow-y-auto">
                  {allFeatures.map((feature) => (
                    <div
                      key={feature.feature_id}
                      className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center flex-1 mr-2">
                        <Check className="text-green-500 mr-2 flex-shrink-0" size={16} />
                        <span className="text-xs sm:text-sm">{feature.feature_name}</span>
                      </div>
                      <Button
                        onClick={() => deleteFeature(feature.feature_id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 border rounded-lg bg-gray-50">
                  <p className="text-xs sm:text-sm text-gray-500">No features found. Add your first feature above.</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-[10px] sm:text-xs text-blue-800">
                <strong>Note:</strong> Features can be shown/hidden per package. Use the eye icon when editing packages.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => setFeatureDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;