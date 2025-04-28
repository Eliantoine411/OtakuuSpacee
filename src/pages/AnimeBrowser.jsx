import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AnimeBrowser = ({ user }) => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInteractions, setUserInteractions] = useState({});
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchAnime();
    if (user) {
      fetchUserInteractions();
    }
  }, [user, page]);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const newAnime = data.data.map(anime => ({
        id: anime.mal_id,
        title: anime.title,
        image_url: anime.images.jpg.large_image_url,
        description: anime.synopsis,
        rating: anime.score,
        episodes: anime.episodes,
        status: anime.status,
        aired: anime.aired.string,
        genres: anime.genres.map(g => g.name).join(', ')
      }));

      setAnimeList(prev => page === 1 ? newAnime : [...prev, ...newAnime]);
      setHasMore(data.pagination.has_next_page);
    } catch (err) {
      console.error('Error fetching anime:', err);
      setError('Failed to load anime list');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_anime_interactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const interactions = {};
      data.forEach(interaction => {
        interactions[interaction.anime_id] = interaction.status;
      });
      setUserInteractions(interactions);
    } catch (err) {
      console.error('Error fetching user interactions:', err);
    }
  };

  const handleInteraction = async (animeId, status) => {
    if (!user) {
      setError('Please sign in to mark anime');
      return;
    }

    try {
      // Check if interaction already exists
      const existingInteraction = userInteractions[animeId];
      
      if (existingInteraction === status) {
        // Remove the interaction
        const { error } = await supabase
          .from('user_anime_interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('anime_id', animeId);

        if (error) throw error;
        
        setUserInteractions(prev => {
          const newInteractions = { ...prev };
          delete newInteractions[animeId];
          return newInteractions;
        });
      } else {
        // Update or create new interaction
        const { error } = await supabase
          .from('user_anime_interactions')
          .upsert({
            user_id: user.id,
            anime_id: animeId,
            status: status
          });

        if (error) throw error;
        
        setUserInteractions(prev => ({
          ...prev,
          [animeId]: status
        }));
      }
    } catch (err) {
      console.error('Error updating interaction:', err);
      setError('Failed to update anime status');
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const handleAnimeClick = async (animeId) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedAnime(data.data);
    } catch (err) {
      console.error('Error fetching anime details:', err);
      setError('Failed to load anime details');
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Browse Anime</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animeList.map((anime) => (
          <div 
            key={anime.id} 
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition duration-200 cursor-pointer"
            onClick={() => handleAnimeClick(anime.id)}
          >
            <img
              src={anime.image_url}
              alt={anime.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-white mb-2">{anime.title}</h2>
              <p className="text-gray-300 mb-4 line-clamp-3">{anime.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteraction(anime.id, 'watched');
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      userInteractions[anime.id] === 'watched'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Watched
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteraction(anime.id, 'favorite');
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      userInteractions[anime.id] === 'favorite'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Favorite
                  </button>
                </div>
                {anime.rating && (
                  <span className="text-yellow-400">
                    ★ {anime.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {selectedAnime && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedAnime.title}</h2>
                <button
                  onClick={() => setSelectedAnime(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img
                  src={selectedAnime.images.jpg.large_image_url}
                  alt={selectedAnime.title}
                  className="w-full rounded-lg"
                />
                <div>
                  <p className="text-gray-300 mb-4">{selectedAnime.synopsis}</p>
                  <div className="space-y-2">
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Rating:</span> {selectedAnime.score}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Episodes:</span> {selectedAnime.episodes}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Status:</span> {selectedAnime.status}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Aired:</span> {selectedAnime.aired.string}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">Genres:</span> {selectedAnime.genres.map(g => g.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeBrowser; 