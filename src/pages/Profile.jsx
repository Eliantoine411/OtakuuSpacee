import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Profile = ({ user }) => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId || user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Profile not found
          if (user && (userId === user.id || !userId)) {
            // Create a new profile for the current user
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  username: user.email.split('@')[0],
                  avatar_url: 'https://i.imgur.com/1Q9ZQ9r.png',
                  bio: 'New anime enthusiast'
                }
              ])
              .select()
              .single();

            if (createError) throw createError;
            setProfile(newProfile);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      const fileExt = file.name.split('.').pop();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      if (!validExtensions.includes(fileExt.toLowerCase())) {
        throw new Error('Invalid file type. Please upload an image file.');
      }

      // Generate a unique file path
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh the profile data
      fetchProfile();
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-md">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={profile?.avatar_url || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            {user && user.id === (userId || user.id) && (
              <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            )}
          </div>

          {uploading && (
            <div className="w-full max-w-xs">
              <div className="bg-gray-700 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <h1 className="text-2xl font-bold text-white">
            {profile?.username || user?.email}
          </h1>

          <div className="text-gray-400">
            Member since {new Date(profile?.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 