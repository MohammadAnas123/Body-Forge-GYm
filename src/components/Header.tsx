import { useState } from 'react';
import { Menu, X, LogOut, Shield, User } from 'lucide-react';
import AuthDialog from './AuthDialog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userName, isAdmin, signOut, loading } = useAuth();

  const gymName = import.meta.env.VITE_GYM_NAME || 'My Gym';

  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Packages', href: '#packages' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  if (loading) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-500/30 shadow-lg shadow-red-500/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">
            <span className="text-white">{gymName.split(" ")[0]}</span>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent ml-1">
              {gymName.split(" ")[1] ? gymName.split(" ")[1] : ""}
            </span>
          </h1>
          <span className="text-sm text-gray-300">Loading...</span>
        </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-500/30 shadow-lg shadow-red-500/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide">
            <span className="text-white">{gymName.split(" ")[0]}</span>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent ml-1">
              {gymName.split(" ")[1] ? gymName.split(" ")[1] : ""}
            </span>
          </h1>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-gray-300 hover:text-red-500 transition-all duration-300 font-medium hover:scale-105"
              >
                {item.name}
              </a>
            ))}

            {isAdmin && (
              <a
                href="/admin/dashboard"
                className="flex items-center text-sm text-gray-300 hover:text-red-500 transition-all duration-300 hover:scale-105 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/30"
              >
                <Shield size={16} className="mr-1.5 text-blue-400" /> Dashboard
              </a>
            )}

            {user && !isAdmin && (
              <a
                href="/member/dashboard"
                className="flex items-center text-sm text-gray-300 hover:text-red-500 transition-all duration-300 hover:scale-105 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/30"
              >
                <User size={16} className="mr-1.5 text-green-400" /> My Dashboard
              </a>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <User size={18} className="text-red-500" />
                  <span className="text-sm text-gray-300">
                    Hi,&nbsp;
                    <span className="font-bold text-white">{formatName(userName)}</span>
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/30 transition-all duration-300 hover:scale-105"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <AuthDialog>
                  <button className="text-gray-300 hover:text-red-500 text-sm transition-all duration-300 hover:scale-105 font-medium">
                    Member Login
                  </button>
                </AuthDialog>
                <AuthDialog isAdmin>
                  <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 text-sm rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 font-medium">
                    Admin Login
                  </button>
                </AuthDialog>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/30 transition-all duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-md rounded-2xl mt-3 mb-4 shadow-2xl shadow-red-500/20 border border-red-500/30 mx-1">
            <nav className="flex flex-col p-5 space-y-3 text-gray-200">
              {/* Navigation Links */}
              <div className="space-y-1">
                {navigation.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10 hover:text-white transition-all duration-300 font-medium border border-transparent hover:border-red-500/30 hover:shadow-md hover:shadow-red-500/20"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Dashboard Links */}
              {(isAdmin || (user && !isAdmin)) && (
                <div className="pt-2 space-y-2">
                  {isAdmin && (
                    <a
                      href="/admin/dashboard"
                      className="flex items-center py-3 px-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                        <Shield size={18} className="text-blue-400" />
                      </div>
                      <span className="font-semibold text-white">Admin Dashboard</span>
                    </a>
                  )}

                  {user && !isAdmin && (
                    <a
                      href="/member/dashboard"
                      className="flex items-center py-3 px-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                        <User size={18} className="text-green-400" />
                      </div>
                      <span className="font-semibold text-white">My Dashboard</span>
                    </a>
                  )}
                </div>
              )}

              {/* Auth Section */}
              <div className="pt-4 mt-2 border-t border-gray-700/50">
                {user ? (
                  <>
                    <div className="flex items-center justify-between p-4 mb-3 bg-gradient-to-r from-red-500/15 to-orange-500/15 rounded-xl border border-red-500/30 shadow-md shadow-red-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-full border border-red-500/40">
                          {isAdmin ? (
                            <Shield size={20} className="text-blue-400" />
                          ) : (
                            <User size={20} className="text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Welcome back</p>
                          <p className="text-white font-bold text-base">{formatName(userName)}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center py-3.5 px-4 text-white font-semibold bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 rounded-xl border border-red-500/40 hover:border-red-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                    >
                      <LogOut size={18} className="mr-2" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <AuthDialog>
                      <button className="w-full py-3.5 px-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/5 hover:border-red-500/40 transition-all duration-300 hover:shadow-md">
                        Member Login
                      </button>
                    </AuthDialog>
                    <AuthDialog isAdmin>
                      <button className="w-full py-3.5 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02] border border-red-400/50">
                        Admin Login
                      </button>
                    </AuthDialog>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;