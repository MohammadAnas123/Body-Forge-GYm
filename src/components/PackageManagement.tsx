import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Edit, Trash2, Save, X, Star, StarOff, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PackageType {
  package_id: string;
  package_name: string;
  description: string;
  duration_days: number;
  price: number;
  features: string[];
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
  features: string[];
  is_active: boolean;
  is_popular: boolean;
}

const PackageManagement = () => {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [featureInput, setFeatureInput] = useState('');
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
    setFeatureInput('');
    setEditingPackage(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setFormData({
      package_name: pkg.package_name,
      description: pkg.description,
      duration_days: pkg.duration_days,
      price: pkg.price,
      features: [...pkg.features],
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

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
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

    if (formData.features.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one feature',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* <div className="flex items-center">
          <div className="bg-blue-500 p-2 rounded-lg mr-3">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Package Management</h2>
            <p className="text-sm text-gray-600">Create and manage gym membership packages</p>
          </div>
        </div> */}
        <Button 
          onClick={openCreateDialog} 
          className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Create Package
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <RefreshCw className="animate-spin mx-auto mb-3 text-blue-500" size={32} />
          <p className="text-gray-600">Loading packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <Package className="mx-auto mb-4 text-gray-400" size={64} />
          <p className="text-gray-600 mb-4">No packages found</p>
          <Button onClick={openCreateDialog} className="bg-blue-500 hover:bg-blue-600">
            <Plus size={16} className="mr-2" />
            Create Your First Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.package_id}
              className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 transition-all hover:shadow-xl ${
                pkg.is_popular ? 'border-yellow-400' : 'border-transparent'
              } ${!pkg.is_active ? 'opacity-60' : ''}`}
            >
              {/* Package Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold flex-1">{pkg.package_name}</h3>
                  {pkg.is_popular && (
                    <Star className="text-yellow-400 fill-yellow-400 flex-shrink-0" size={20} />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  pkg.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Price and Duration */}
              <div className="mb-4 pb-4 border-b">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  ₹{pkg.price.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-gray-600">{getDurationText(pkg.duration_days)}</div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
                <ul className="space-y-1">
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2 flex-shrink-0">•</span>
                      <span className="line-clamp-1">{feature}</span>
                    </li>
                  ))}
                  {pkg.features.length > 3 && (
                    <li className="text-sm text-gray-500 italic">
                      +{pkg.features.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => openEditDialog(pkg)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Edit size={14} className="mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  onClick={() => togglePackageStatus(pkg)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                  title={pkg.is_active ? 'Deactivate' : 'Activate'}
                >
                  {pkg.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button
                  onClick={() => togglePopular(pkg)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                  title={pkg.is_popular ? 'Remove Popular' : 'Mark Popular'}
                >
                  {pkg.is_popular ? <StarOff size={14} /> : <Star size={14} />}
                </Button>
                <Button
                  onClick={() => deletePackage(pkg.package_id)}
                  size="sm"
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Package Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Package Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Package Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="package_name"
                value={formData.package_name}
                onChange={handleInputChange}
                placeholder="e.g., Basic, Premium, Elite"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the package"
                className="w-full border border-gray-300 rounded-lg p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="2999"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (Days) <span className="text-red-500">*</span>
                </label>
                <select
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">1 Month (30 days)</option>
                  <option value="90">3 Months (90 days)</option>
                  <option value="180">6 Months (180 days)</option>
                  <option value="365">1 Year (365 days)</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Features <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button onClick={addFeature} type="button" size="sm">
                  <Plus size={16} />
                </Button>
              </div>
              
              {formData.features.length > 0 && (
                <div className="space-y-2 mt-3">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm flex-1 mr-2">{feature}</span>
                      <Button
                        onClick={() => removeFeature(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={() => handleCheckboxChange('is_active')}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm">Active</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={() => handleCheckboxChange('is_popular')}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm">Mark as Popular</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={handleSubmit}
              >
                <Save size={16} className="mr-2" />
                {editingPackage ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;