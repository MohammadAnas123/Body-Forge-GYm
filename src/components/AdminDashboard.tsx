// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, RefreshCw, Bell, LogOut, Menu, Package as PackageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import PackageManagement from './AdminDashComponents/PackageManagement';
import NotificationsAndMessages from './AdminDashComponents/NotificationsAndMessages';
import UserManagement from './AdminDashComponents/UserManagement';

type ActiveTab = 'users' | 'packages' | 'notifications';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 🌟 NEW STATE: To prevent re-rendering during redirect after logout 🌟
  const [isLoggingOut, setIsLoggingOut] = useState(false); 
  
  const { isAdmin, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    // 1. Set logging out state immediately
    setIsLoggingOut(true); 
    try {
      await signOut();
      // 2. Force navigation to home with hash
      window.location.href = '/#home'; 
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
      // 3. Reset state only if logout fails
      setIsLoggingOut(false); 
    }
  };

  const handleGoHome = () => {
    window.location.href = '/#home'; 
  };

  // 🌟 MODIFIED LOADING/LOGOUT CHECKS 🌟

  if (authLoading || isLoggingOut) { // Check if we are logging out
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
          <p className="text-gray-700 font-medium">{isLoggingOut ? 'Logging out...' : 'Loading Dashboard...'}</p>
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

  // ... rest of the component (TabNavigation and main return block) remains the same ...
  // ... (main dashboard render)
  
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
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Icon container */}
              <div
                className={`p-2 sm:p-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-300/40 ring-1 ring-blue-400/40'
                    : activeTab === 'packages'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-pink-300/40 ring-1 ring-pink-400/40'
                    : 'bg-gradient-to-br from-green-500 to-teal-600 shadow-green-300/40 ring-1 ring-green-400/40'
                }`}
              >
                {activeTab === 'users' && <Users className="text-white" size={16} />}
                {activeTab === 'packages' && <PackageIcon className="text-white" size={16} />}
                {activeTab === 'notifications' && <Bell className="text-white" size={16} />}
              </div>

              {/* Text section */}
              <div>
                <h1 className="text-sm sm:text-base font-bold text-gray-900">
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
                onClick={handleGoHome} 
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
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'packages' && <PackageManagement />}
        {activeTab === 'notifications' && <NotificationsAndMessages />}
      </div>
    </div>
  );
};

export default AdminDashboard;