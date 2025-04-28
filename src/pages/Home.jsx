import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Home = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPosts();
  }, [sortBy, sortOrder]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select('*');

      // Apply search filter if search term exists
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Discussions</h1>
        {user && (
          <Link
            to="/create"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
          >
            Create Post
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
        </form>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleSort('created_at')}
            className={`px-4 py-2 rounded-md ${
              sortBy === 'created_at'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            Sort by Date {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('upvotes')}
            className={`px-4 py-2 rounded-md ${
              sortBy === 'upvotes'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            Sort by Upvotes {sortBy === 'upvotes' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/40'}
                    alt={user?.email}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-gray-300">{user?.email}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-pink-500">↑</span>
                  <span className="text-gray-300">{post.upvotes}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  Click to view details
                </span>
              </div>
            </div>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No posts found. {user && 'Be the first to create one!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 