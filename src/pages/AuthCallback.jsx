import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profile) {
            // Create profile for new user
            await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  username: session.user.email.split('@')[0],
                  avatar_url: 'https://i.imgur.com/1Q9ZQ9r.png',
                  bio: 'New anime enthusiast',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]);
          }
        }
        
        navigate('/');
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
};

export default AuthCallback; 