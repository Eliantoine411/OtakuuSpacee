import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-blue-100 to-purple-200 p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto"
      >
        <div className="flex items-center space-x-6 mb-8">
          <motion.img
            src={user.avatar}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-pink-500 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
          <div>
            <h1 className="text-3xl font-extrabold logo-anime">Welcome, {user.username}!</h1>
            <p className="text-gray-600">Your anime journey awaits...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/browse" className="group">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-lg text-white shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-2">Browse Anime</h2>
              <p className="opacity-90">Discover new anime and add them to your favorites</p>
            </motion.div>
          </Link>

          <Link to="/create" className="group">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-lg text-white shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-2">Create Post</h2>
              <p className="opacity-90">Share your thoughts about your favorite anime</p>
            </motion.div>
          </Link>

          <Link to="/profile" className="group">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
              <p className="opacity-90">View and edit your profile information</p>
            </motion.div>
          </Link>

          <Link to="/favorites" className="group">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 rounded-lg text-white shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-2">Favorites</h2>
              <p className="opacity-90">See your favorite anime and posts</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 