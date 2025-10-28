import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, CheckCircle, XCircle, Search, RefreshCw, Eye, X, Calendar, Package as PackageIcon, CreditCard, Plus, AlertTriangle, Ban, Bell, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  const navigate = useNavigate();
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, authLoading]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

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

  const rejectUser = async (userId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('user_master')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.error('Error deleting user from auth:', authDeleteError);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
          <p className="text-gray-700 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
          <Shield className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Home
          </Button>
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

  const TabNavigation = () => (
    <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
      <button
        onClick={() => {
          setActiveTab('users');
          setMobileMenuOpen(false);
        }}
        className={`${
          activeTab === 'users'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center sm:justify-start transition-all`}
      >
        <Users className="mr-2" size={18} />
        User Management
      </button>
      <button
        onClick={() => {
          setActiveTab('packages');
          setMobileMenuOpen(false);
        }}
        className={`${
          activeTab === 'packages'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center sm:justify-start transition-all`}
      >
        <PackageIcon className="mr-2" size={18} />
        Packages
      </button>
      <button
        onClick={() => {
          setActiveTab('notifications');
          setMobileMenuOpen(false);
        }}
        className={`${
          activeTab === 'notifications'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center sm:justify-start transition-all`}
      >
        <Bell className="mr-2" size={18} />
        Notifications
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg shadow-sm transition-all ${
                activeTab === 'users' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                  : activeTab === 'packages'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                  : 'bg-gradient-to-br from-green-500 to-teal-600'
              }`}>
                {activeTab === 'users' && <Users className="text-white" size={20} />}
                {activeTab === 'packages' && <PackageIcon className="text-white" size={20} />}
                {activeTab === 'notifications' && <Bell className="text-white" size={20} />}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'packages' && 'Package Management'}
                  {activeTab === 'notifications' && 'Notifications'}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Admin Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Mobile Menu Toggle */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <div className="flex items-center space-x-2 mb-6 pb-4 border-b">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                      <Shield className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Admin Panel</h2>
                      <p className="text-xs text-gray-500">Navigation</p>
                    </div>
                  </div>
                  <TabNavigation />
                </SheetContent>
              </Sheet>

              {/* Home Button */}
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
              >
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">🏠</span>
              </Button>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Desktop Tab Navigation */}
        <div className="mb-6 hidden lg:block">
          <TabNavigation />
        </div>

        {/* Conditional Rendering based on Active Tab */}
        {activeTab === 'packages' ? (
          <PackageManagement />
        ) : activeTab === 'notifications' ? (
          <NotificationsAndMessages />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col">
                  <Users className="text-blue-500 mb-2" size={28} />
                  <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col">
                  <CheckCircle className="text-green-500 mb-2" size={28} />
                  <p className="text-xs sm:text-sm text-gray-600">Approved</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col">
                  <Shield className="text-orange-500 mb-2" size={28} />
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col">
                  <PackageIcon className="text-blue-500 mb-2" size={28} />
                  <p className="text-xs sm:text-sm text-gray-600">Active Plans</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.activePlans}</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow col-span-2 lg:col-span-1">
                <div className="flex flex-col">
                  <Ban className="text-red-500 mb-2" size={28} />
                  <p className="text-xs sm:text-sm text-gray-600">Blacklisted</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.blacklisted}</p>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
              <div className="flex flex-col lg:flex-row gap-3">
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
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'approved' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('approved')}
                    size="sm"
                    className={`flex-1 sm:flex-none ${filterStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('pending')}
                    size="sm"
                    className={`flex-1 sm:flex-none ${filterStatus === 'pending' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  >
                    Pending
                  </Button>
                  <Button onClick={fetchUsers} variant="outline" size="sm">
                    <RefreshCw size={16} className="mr-1" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Users Table/Cards */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-3 text-blue-500" size={32} />
                    <span className="text-gray-600">Loading users...</span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Users className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
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
                          <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
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
                                  Pending
                                </span>
                              ) : (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.status === 'active' ? 'Active' : 'Inactive'}
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
                                    View
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <div key={user.user_id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{user.user_name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500 mt-1">{user.contact_number}</p>
                          </div>
                          {user.is_blacklisted ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Blacklisted
                            </span>
                          ) : !user.admin_approved ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              Pending
                            </span>
                          ) : (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {user.is_blacklisted ? (
                            <span className="text-red-600 text-xs">Blacklisted User</span>
                          ) : !user.admin_approved ? (
                            <>
                              <Button
                                onClick={() => approveUser(user.user_id)}
                                size="sm"
                                className="flex-1 bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle size={14} className="mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => rejectUser(user.user_id)}
                                size="sm"
                                variant="destructive"
                                className="flex-1"
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
                              className="w-full"
                            >
                              <Eye size={14} className="mr-1" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
              <span className="text-lg sm:text-xl">User Details - {selectedUser?.user_name}</span>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
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
                        className="flex-1 sm:flex-none"
                      >
                        <Ban size={14} className="mr-1" />
                        Blacklist
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedUser.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium break-all">{selectedUser.email}</p>
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
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base sm:text-lg">{purchase.package_name}</h4>
                              <p className="text-sm text-gray-600">
                                Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
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
                              <p className="font-medium flex items-center text-sm">
                                <Calendar size={14} className="mr-1" />
                                {new Date(purchase.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">End Date</p>
                              <p className="font-medium flex items-center text-sm">
                                <Calendar size={14} className="mr-1" />
                                {new Date(purchase.end_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {isActive ? (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-700">
                                  Active Plan
                                </span>
                                <span className="text-sm font-semibold text-green-700">
                                  {daysRemaining} days remaining
                                </span>
                              </div>
                              <div className="bg-green-200 rounded-full h-2">
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
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