import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Users, CheckCircle, XCircle, Search, RefreshCw, Eye, X, Calendar, Package as PackageIcon, CreditCard, Plus, AlertTriangle, Ban, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddPurchaseModal from './AddPurchaseModal';
import PackageManagement from './PackageManagement';
import NotificationsAndMessages from './NotificationsAndMessages';

interface User {
  user_id: string;
  user_name: string;
  email: string;
  contact_number: string;
  Gender: string;
  status: string;
  admin_approved: boolean;
  is_blacklisted: boolean;
  blacklist_reason: string;
  created_at: string;
}

interface UserPurchase {
  purchase_id: string;
  package_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  payment_status: string;
  created_at: string;
}

type ActiveTab = 'users' | 'packages' | 'notifications';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, authLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_master')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPurchases = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPurchases(data || []);
      
      if (data && data.length > 0) {
        const activePlan = data.find(p => {
          const endDate = new Date(p.end_date);
          const today = new Date();
          return p.payment_status === 'completed' && endDate >= today;
        });
        
        if (activePlan) {
          setHasActivePlan(true);
          const daysLeft = calculateDaysRemaining(activePlan.end_date);
          const totalDays = calculateTotalDays(activePlan.start_date, activePlan.end_date);
          const dailyRate = activePlan.amount / totalDays;
          const refund = Math.round(dailyRate * daysLeft);
          
          setRemainingDays(daysLeft);
          setRefundAmount(refund);
        } else {
          setHasActivePlan(false);
          setRemainingDays(0);
          setRefundAmount(0);
        }
      } else {
        setHasActivePlan(false);
        setRemainingDays(0);
        setRefundAmount(0);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch purchase history',
        variant: 'destructive',
      });
      setUserPurchases([]);
      setHasActivePlan(false);
      setRemainingDays(0);
      setRefundAmount(0);
    } finally {
      setLoadingDetails(false);
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const calculateTotalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_master')
        .update({ admin_approved: true })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User approved successfully',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // const rejectUser = async (userId: string) => {
  //   try {
  //     const { error: deleteError } = await supabase
  //       .from('user_master')
  //       .delete()
  //       .eq('user_id', userId);

  //     if (deleteError) throw deleteError;
  //     toast({
  //       title: 'Success',
  //       description: 'User rejected and removed',
  //     });

  //     fetchUsers();
  //   } catch (error: any) {
  //     toast({
  //       title: 'Error',
  //       description: error.message,
  //       variant: 'destructive',
  //     });
  //   }
  // };


  const rejectUser = async (userId: string) => {
  try {
    // First, delete from user_master table
    const { error: deleteError } = await supabase
      .from('user_master')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Then, delete from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      userId
    );

    if (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError);
      // Note: User is already deleted from user_master, so we'll show a warning
      toast({
        title: 'Partial Success',
        description: 'User removed from database but could not be deleted from authentication system',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'User rejected and completely removed',
      });
    }

    fetchUsers();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  }
};

  const openBlacklistDialog = () => {
    setBlacklistDialogOpen(true);
  };

  const handleBlacklist = async () => {
    if (!selectedUser || !blacklistReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for blacklisting',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_master')
        .update({ 
          is_blacklisted: true,
          blacklist_reason: blacklistReason,
          status: 'inactive',
          admin_approved: false
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast({
        title: 'User Blacklisted',
        description: `${selectedUser.user_name} has been blacklisted.${hasActivePlan ? ` Refund amount: ₹${refundAmount}` : ''}`,
      });

      setBlacklistDialogOpen(false);
      setUserDetailsOpen(false);
      setBlacklistReason('');
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
    fetchUserPurchases(user.user_id);
    setBlacklistReason('');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'approved') return matchesSearch && user.admin_approved;
    if (filterStatus === 'pending') return matchesSearch && !user.admin_approved;
    
    return matchesSearch;
  });

  const stats = {
    total: users.length,
    approved: users.filter(u => u.admin_approved).length,
    pending: users.filter(u => !u.admin_approved).length,
    activePlans: users.filter(u => u.status === 'active' && u.admin_approved).length,
    blacklisted: users.filter(u => u.is_blacklisted).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Shield className="mr-3 text-blue-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage user accounts, approvals, and subscriptions</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Users className="mr-2" size={20} />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`${
                  activeTab === 'packages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <PackageIcon className="mr-2" size={20} />
                Package Management
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Bell className="mr-2" size={20} />
                Notifications & Messages
              </button>
            </nav>
          </div>
        </div>

        {/* Conditional Rendering based on Active Tab */}
        {activeTab === 'packages' ? (
          <PackageManagement />
        ) : activeTab === 'notifications' ? (
          <NotificationsAndMessages />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="text-blue-500" size={32} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="text-green-500" size={32} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <Shield className="text-orange-500" size={32} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Plans</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activePlans}</p>
                  </div>
                  <PackageIcon className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Blacklisted</p>
                    <p className="text-2xl font-bold text-red-600">{stats.blacklisted}</p>
                  </div>
                  <Ban className="text-red-500" size={32} />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'approved' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('approved')}
                    className={filterStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('pending')}
                    className={filterStatus === 'pending' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    Pending
                  </Button>
                </div>
                
                <Button onClick={fetchUsers} variant="outline">
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="animate-spin mr-2" size={24} />
                  <span>Loading users...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.contact_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.Gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.is_blacklisted ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Blacklisted
                              </span>
                            ) : !user.admin_approved ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                Pending Approval
                              </span>
                            ) : (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.status === 'active' ? 'Active Plan' : 'No Plan'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {user.is_blacklisted ? (
                                <span className="text-red-600 text-xs">Blacklisted</span>
                              ) : !user.admin_approved ? (
                                <>
                                  <Button
                                    onClick={() => approveUser(user.user_id)}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => rejectUser(user.user_id)}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <XCircle size={14} className="mr-1" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => openUserDetails(user)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Eye size={14} className="mr-1" />
                                  View Details
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>User Details - {selectedUser?.user_name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserDetailsOpen(false)}
              >
                <X size={20} />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="flex gap-2">
                    <AddPurchaseModal 
                      userId={selectedUser.user_id}
                      userName={selectedUser.user_name}
                      onPurchaseAdded={() => {
                        fetchUserPurchases(selectedUser.user_id);
                        fetchUsers();
                      }}
                    />
                    {!selectedUser.is_blacklisted && (
                      <Button
                        onClick={openBlacklistDialog}
                        size="sm"
                        variant="destructive"
                      >
                        <Ban size={14} className="mr-1" />
                        Blacklist User
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedUser.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{selectedUser.contact_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{selectedUser.Gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedUser.status === 'active'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.status === 'active' ? 'Active Plan' : 'No Active Plan'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Purchase History
                </h3>
                
                {loadingDetails ? (
                  <div className="text-center py-8">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-gray-600">Loading purchase history...</p>
                  </div>
                ) : userPurchases.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <PackageIcon className="mx-auto mb-2 text-gray-400" size={48} />
                    <p className="text-gray-600">No purchases yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userPurchases.map((purchase) => {
                      const daysRemaining = calculateDaysRemaining(purchase.end_date);
                      const isActive = daysRemaining > 0 && purchase.payment_status === 'completed';
                      
                      return (
                        <div
                          key={purchase.purchase_id}
                          className={`border rounded-lg p-4 ${
                            isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{purchase.package_name}</h4>
                              <p className="text-sm text-gray-600">
                                Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">₹{purchase.amount}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                purchase.payment_status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {purchase.payment_status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                            <div>
                              <p className="text-xs text-gray-600">Start Date</p>
                              <p className="font-medium flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {new Date(purchase.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">End Date</p>
                              <p className="font-medium flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {new Date(purchase.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {isActive ? (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-700">
                                  Active Plan
                                </span>
                                <span className="text-sm font-semibold text-green-700">
                                  {daysRemaining} days remaining
                                </span>
                              </div>
                              <div className="mt-2 bg-green-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.max(0, Math.min(100, (daysRemaining / 30) * 100))}%`
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 pt-3 border-t">
                              <span className="text-sm text-gray-600">
                                Expired {Math.abs(daysRemaining)} days ago
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Blacklist Confirmation Dialog */}
      <Dialog open={blacklistDialogOpen} onOpenChange={setBlacklistDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2" size={24} />
              Blacklist User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-2">
                <strong>Warning:</strong> This action will:
              </p>
              <ul className="text-sm text-red-700 list-disc ml-5 space-y-1">
                <li>Immediately deactivate user's account</li>
                <li>Revoke gym access</li>
                <li>Cancel any active membership</li>
                <li>User will be logged out</li>
              </ul>
            </div>

            {hasActivePlan && remainingDays > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Refund Calculation</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>Days Remaining: <strong>{remainingDays} days</strong></p>
                  <p className="text-lg font-bold text-yellow-900">
                    Refund Amount: ₹{refundAmount}
                  </p>
                  <p className="text-xs mt-2">
                    Please return this amount to the user
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Reason for Blacklisting <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter reason (e.g., misconduct, violation of gym rules, etc.)"
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setBlacklistDialogOpen(false);
                  setBlacklistReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleBlacklist}
                disabled={!blacklistReason.trim()}
              >
                <Ban size={16} className="mr-1" />
                Confirm Blacklist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;