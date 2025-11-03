// components/AddPurchaseModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, Trash2, AlertTriangle, X } from 'lucide-react';

interface PackageType {
  package_id: string;
  package_name: string;
  duration_days: number;
  price: number;
  description: string;
}

interface AddPurchaseProps {
  userId: string;
  userName: string;
  onPurchaseAdded?: () => void;
}

const AddPurchaseModal = ({ userId, userName, onPurchaseAdded }: AddPurchaseProps) => {
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPackages();
      fetchUserPurchases();
    }
  }, [open]);

  const formatDate = (dateStr) => 
  new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('duration_days', { ascending: true });

    if (!error && data) {
      setPackages(data);
    }
  };

  const fetchUserPurchases = async () => {
    const { data, error } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUserPurchases(data);
    }
  };

  const handleAddPurchase = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    const selectedPkg = packages.find(p => p.package_id === selectedPackage);
    if (!selectedPkg) return;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + selectedPkg.duration_days);

    const { error } = await supabase.from('user_purchases').insert([{
      user_id: userId,
      package_id: selectedPkg.package_id,
      package_name: selectedPkg.package_name,
      amount: selectedPkg.price,
      duration_days: selectedPkg.duration_days,
      start_date: startDate,
      end_date: end.toISOString().split('T')[0],
      payment_status: 'completed',
      payment_method: paymentMethod,
      transaction_id: transactionId || null,
    }]);

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Package added for ${userName}` });
      
      // Update user status to active
      await supabase
        .from('user_master')
        .update({ status: 'active' })
        .eq('user_id', userId);

      setSelectedPackage('');
      setTransactionId('');
      fetchUserPurchases();
      if (onPurchaseAdded) onPurchaseAdded();
    }
  };

  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return;

    try {
      const { error } = await supabase
        .from('user_purchases')
        .delete()
        .eq('purchase_id', purchaseToDelete);

      if (error) throw error;

      // Check if user has any remaining active purchases
      const { data: remainingPurchases } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('payment_status', 'completed')
        .gte('end_date', new Date().toISOString());

      // Update user status if no active purchases remain
      if (!remainingPurchases || remainingPurchases.length === 0) {
        await supabase
          .from('user_master')
          .update({ status: 'inactive' })
          .eq('user_id', userId);
      }

      toast({
        title: 'Success',
        description: 'Purchase deleted successfully',
      });

      setDeleteDialog(false);
      setPurchaseToDelete(null);
      fetchUserPurchases();
      if (onPurchaseAdded) onPurchaseAdded();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (purchaseId: string) => {
    setPurchaseToDelete(purchaseId);
    setDeleteDialog(true);
  };

  const selectedPkg = packages.find(p => p.package_id === selectedPackage);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            <Plus size={16} className="mr-1" />
            Manage Purchases
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="mr-2" size={20} />
                Manage Packages for {userName}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Purchase Section */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-4">Add New Package</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Package</label>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.package_id} value={pkg.package_id}>
                          {pkg.package_name} - ₹{pkg.price} ({pkg.duration_days} days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPkg && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="font-semibold">{selectedPkg.package_name}</div>
                    <div className="text-sm mt-1">{selectedPkg.description}</div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Duration: {selectedPkg.duration_days} days</span>
                      <span className="font-bold">₹{selectedPkg.price}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod !== 'cash' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Transaction ID</label>
                    <Input
                      placeholder="Enter transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={handleAddPurchase}
                  disabled={loading || !selectedPackage}
                >
                  {loading ? 'Adding...' : 'Add Purchase'}
                </Button>
              </div>
            </div>

            {/* Existing Purchases Section */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Purchase History</h3>
              {userPurchases.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="mx-auto mb-2 text-gray-400" size={48} />
                  <p className="text-gray-600">No purchases yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {userPurchases.map((purchase) => {
                    const isActive = new Date(purchase.end_date) >= new Date() && purchase.payment_status === 'completed';
                    
                    return (
                      <div
                        key={purchase.purchase_id}
                        className={`border rounded-lg p-4 ${
                          isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{purchase.package_name}</h4>
                              {isActive && (
                                <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(purchase.start_date)} - {formatDate(purchase.end_date)}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-gray-700">
                                <strong>Amount:</strong> ₹{purchase.amount}
                              </span>
                              <span className="text-gray-700">
                                <strong>Payment:</strong> {purchase.payment_method}
                              </span>
                            </div>
                            {purchase.transaction_id && (
                              <p className="text-xs text-gray-500 mt-1">
                                Transaction ID: {purchase.transaction_id}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => openDeleteDialog(purchase.purchase_id)}
                            size="sm"
                            variant="destructive"
                            className="ml-2"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-red-600">
              <div className="flex items-center">
                <AlertTriangle className="mr-2" size={24} />
                Delete Purchase
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeleteDialog(false);
                  setPurchaseToDelete(null);
                }}
              >
                <X size={20} />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete this purchase record. This action cannot be undone.
              </p>
            </div>

            <p className="text-sm text-gray-700">
              Are you sure you want to delete this purchase?
            </p>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDeleteDialog(false);
                  setPurchaseToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleDeletePurchase}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddPurchaseModal;