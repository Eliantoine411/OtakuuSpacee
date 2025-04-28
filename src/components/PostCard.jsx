import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const PostCard = ({ post, user }) => {
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = async () => {
    if (!user) return;

    const newLikes = isLiked
      ? post.likes.filter(id => id !== user.id)
      : [...(post.likes || []), user.id];

    const { error } = await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', post.id);

    if (!error) {
      setIsLiked(!isLiked);
      setLikeCount(newLikes.length);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('bookmarks')
      .upsert({
        user_id: user.id,
        post_id: post.id,
        created_at: new Date().toISOString()
      });

    if (!error) {
      setIsBookmarked(!isBookmarked);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-xl"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${post.user_id}`}>
              <img
                src={post.user_avatar || `https://ui-avatars.com/api/?name=${post.username}&background=6366f1&color=fff`}
                alt={post.username}
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
            </Link>
            <div>
              <Link
                to={`/profile/${post.user_id}`}
                className="text-white font-medium hover:text-purple-400 transition-colors"
              >
                {post.username}
              </Link>
              <p className="text-gray-400 text-sm">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
          </div>
        </div>

        <Link to={`/post/${post.id}`}>
          <h3 className="text-xl font-semibold text-white mb-2 hover:text-purple-400 transition-colors">
            {post.title}
          </h3>
        </Link>

        <div className="prose prose-invert max-w-none">
          <p className={`text-gray-300 ${!isExpanded && 'line-clamp-3'}`}>
            {post.content}
          </p>
          {post.content.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {post.image_url && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-pink-500 hover:text-pink-400'
                  : 'text-gray-400 hover:text-pink-500'
              }`}
            >
              <motion.svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                whileTap={{ scale: 0.9 }}
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </motion.svg>
              <span>{likeCount}</span>
            </button>

            <Link
              to={`/post/${post.id}`}
              className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 p-2 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {post.tags?.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm hover:bg-purple-800/50 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard; 