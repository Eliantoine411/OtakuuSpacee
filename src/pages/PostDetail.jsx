import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const PostDetail = ({ user }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
      setEditTitle(data.title);
      setEditContent(data.content || '');
      setEditImageUrl(data.image_url || '');
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      setError('Please sign in to upvote');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({ upvotes: post.upvotes + 1 })
        .eq('id', postId);

      if (error) throw error;
      setPost(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));
    } catch (err) {
      console.error('Error upvoting:', err);
      setError('Failed to upvote post');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to comment');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: editTitle,
          content: editContent,
          image_url: editImageUrl
        })
        .eq('id', postId);

      if (error) throw error;
      setIsEditing(false);
      fetchPost();
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-500 text-white p-4 rounded-md">
          Post not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-md">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
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

        {isEditing ? (
          <form onSubmit={handleUpdatePost} className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600"
              required
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600"
              rows="4"
            />
            <input
              type="text"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
            )}
            {post.content && (
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={handleUpvote}
                className="flex items-center space-x-2 text-pink-500 hover:text-pink-400"
              >
                <span className="text-2xl">↑</span>
                <span>{post.upvotes}</span>
              </button>
              {user && user.id === post.user_id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 mb-2"
              rows="3"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p className="text-gray-400 mb-6">
            Please <Link to="/auth" className="text-pink-500 hover:text-pink-400">sign in</Link> to comment
          </p>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={comment.profiles.avatar_url || 'https://via.placeholder.com/32'}
                    alt={comment.profiles.username || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-300">{comment.profiles.username || 'Anonymous'}</span>
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 