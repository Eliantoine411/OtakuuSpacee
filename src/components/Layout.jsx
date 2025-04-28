import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Layout = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [sakuraParticles, setSakuraParticles] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Subscribe to notifications
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, 
          payload => {
            setNotifications(prev => [payload.new, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    // Fetch current anime season
    const fetchCurrentSeason = async () => {
      try {
        const response = await fetch('https://api.jikan.moe/v4/seasons/now');
        const data = await response.json();
        setCurrentSeason(data.data);
      } catch (error) {
        console.error('Error fetching current season:', error);
      }
    };
    fetchCurrentSeason();
  }, []);

  // Create sakura particles
  useEffect(() => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }));
    setSakuraParticles(particles);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/anime', label: 'Anime', icon: '🎬' },
    { path: '/create', label: 'Create Post', icon: '✏️' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Sakura Petals Background */}
      {sakuraParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-pink-300 text-2xl"
          initial={{ x: `${particle.x}%`, y: -10 }}
          animate={{
            y: '100vh',
            rotate: 360,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          ✿
        </motion.div>
      ))}

      {/* Glowing Orb Effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-gray-900/50 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl text-purple-400">✿</span>
                <span className="text-white font-bold text-xl">OtakuSpace</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-purple-400'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-xl">🔔</span>
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <img
                        src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-purple-500"
                      />
                    </button>

                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden"
                        >
                          <Link
                            to={`/profile/${user.id}`}
                            className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                          >
                            Your Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 text-base font-medium ${
                    location.pathname === item.path
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-purple-400'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Current Season Anime */}
      {currentSeason && (
        <div className="fixed bottom-4 right-4 z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-xl max-w-xs"
          >
            <h3 className="text-white font-semibold mb-2">Current Season</h3>
            <div className="space-y-2">
              {currentSeason.slice(0, 3).map((anime) => (
                <div key={anime.mal_id} className="flex items-center space-x-2">
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{anime.title}</p>
                    <p className="text-gray-400 text-xs">{anime.score || 'N/A'}/10</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Notifications Panel */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-16 right-4 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-gray-300">{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No notifications yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/50 backdrop-blur-md border-t border-gray-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">✿</span>
              <span className="text-white">OtakuSpace</span>
            </div>
            <div className="mt-4 md:mt-0 text-gray-400 text-sm">
              © {new Date().getFullYear()} OtakuSpace. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 