import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const CommentSection = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
    subscribeToComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    }
  };

  const subscribeToComments = () => {
    const subscription = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment.trim(),
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      setError('Failed to delete comment');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-4">
            <img
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
              alt={user.username}
              className="w-10 h-10 rounded-full border-2 border-purple-500"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isLoading || !newComment.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">
            Please <a href="/login" className="text-purple-400 hover:text-purple-300">sign in</a> to comment
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={comment.user.avatar_url || `https://ui-avatars.com/api/?name=${comment.user.username}&background=6366f1&color=fff`}
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full border-2 border-purple-500"
                  />
                  <div>
                    <p className="text-white font-medium">
                      {comment.user.username}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p className="mt-3 text-gray-300">
                {comment.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentSection; 