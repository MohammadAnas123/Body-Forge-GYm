import { useState } from 'react';
import { Menu, X, LogOut, Shield, User } from 'lucide-react';
import AuthDialog from './AuthDialog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Header = () => {
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userName, isAdmin, signOut, loading } = useAuth();

  // Helper to capitalize first letter
  const formatName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Packages', href: '#packages' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <header className="bg-black text-white fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-500">BODY FORGE</h1>
            </div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-red-500">BODY FORGE</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-red-500 transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
            {/* Dashboard Links */}
            {isAdmin && (
              <a
                href="/admin/dashboard"
                className="text-white hover:text-red-500 transition-colors flex items-center"
              >
                <Shield size={16} className="mr-1" />
                Admin Dashboard
              </a>
            )}
            {user && !isAdmin && (
              <a
                href="/member/dashboard"
                className="text-white hover:text-red-500 transition-colors flex items-center"
              >
                <User size={16} className="mr-1" />
                My Dashboard
              </a>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-4 items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <Shield size={18} className="text-blue-400" />
                  )}
                  <span className="text-white">
                    Welcome, <span className="font-semibold">{formatName(userName)}</span>
                    {isAdmin && <span className="ml-1 text-blue-400 text-sm">(Admin)</span>}
                  </span>
                </div>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  className="text-white hover:text-red-500 hover:bg-transparent"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <AuthDialog>
                  <button className="text-white hover:text-red-500 transition-colors">
                    Member Login
                  </button>
                </AuthDialog>
                <AuthDialog isAdmin>
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                    Admin Login
                  </button>
                </AuthDialog>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-red-500"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-white hover:text-red-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              {/* Mobile Dashboard Links */}
              {isAdmin && (
                <a
                  href="/admin/dashboard"
                  className="block px-3 py-2 text-white hover:text-red-500 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield size={16} className="mr-2" />
                  Admin Dashboard
                </a>
              )}
              {user && !isAdmin && (
                <a
                  href="/member/dashboard"
                  className="block px-3 py-2 text-white hover:text-red-500 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} className="mr-2" />
                  My Dashboard
                </a>
              )}
              
              <div className="pt-4 space-y-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-white flex items-center space-x-2">
                      {isAdmin && (
                        <Shield size={16} className="text-blue-400" />
                      )}
                      <span>
                        Welcome, {formatName(userName)}
                        {isAdmin && <span className="ml-1 text-blue-400 text-sm">(Admin)</span>}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-left px-3 py-2 text-white hover:text-red-500 justify-start"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <AuthDialog>
                      <button 
                        className="block w-full text-left px-3 py-2 text-white hover:text-red-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Member Login
                      </button>
                    </AuthDialog>
                    <AuthDialog isAdmin>
                      <button 
                        className="block w-full text-left px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Login
                      </button>
                    </AuthDialog>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;