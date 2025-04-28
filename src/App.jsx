import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import CreatePost from './pages/CreatePost';
import AnimeBrowser from './pages/AnimeBrowser';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import PasswordReset from './pages/PasswordReset';
import { AuthProvider } from './contexts/AuthContext';
import SignupPage from './pages/SignupPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchPosts();
      }
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchPosts();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <Layout user={user}>
          <Routes>
            <Route path="/" element={<Home user={user} posts={posts} />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage onAuth={setUser} />} />
            <Route path="/auth/reset-password" element={<PasswordReset />} />
            <Route path="/create" element={user ? <CreatePost user={user} /> : <Navigate to="/auth" />} />
            <Route path="/anime" element={<AnimeBrowser user={user} />} />
            <Route path="/profile/:userId" element={<Profile user={user} />} />
            <Route path="/post/:postId" element={<PostDetail user={user} />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
