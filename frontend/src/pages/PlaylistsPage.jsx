import React, { useState, useEffect, useCallback } from 'react';
import {
  ListVideo,
  Plus,
  Loader2,
  AlertCircle,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserPlaylists, deletePlaylist } from '../api/playlist.api';
import PlaylistCard from '../components/playlist/PlaylistCard';
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal';
import Button from '../components/common/Button';

/**
 * My Playlists Page for the authenticated user.
 * Displays user's playlists, supports creation and deletion.
 * Light theme only (#7C3AED, #F8FAFC, #FFFFFF).
 */
export default function PlaylistsPage() {
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Fetch playlists created by the logged-in user
  const fetchPlaylists = useCallback(async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await getUserPlaylists(user._id);
      const data = Array.isArray(res?.data) ? res.data : [];
      setPlaylists(data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load your playlists. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Handle new playlist created
  const handlePlaylistCreated = (newPlaylist) => {
    if (newPlaylist) {
      setPlaylists((prev) => [newPlaylist, ...prev]);
    } else {
      fetchPlaylists();
    }
  };

  // Handle playlist deletion
  const handleDeletePlaylist = async (playlistId, playlistName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the playlist "${playlistName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeleteError('');
      setDeleteSuccess('');
      await deletePlaylist(playlistId);
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      setDeleteSuccess(`Playlist "${playlistName}" was deleted.`);
      setTimeout(() => setDeleteSuccess(''), 4000);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || 'Failed to delete playlist. Please try again.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center border border-purple-200">
              <ListVideo className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                My Playlists
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Organize, manage, and watch your saved video collections
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchPlaylists}
            disabled={isLoading}
            title="Refresh playlists"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
          >
            Create Playlist
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {deleteSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
          {deleteSuccess}
        </div>
      )}

      {deleteError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {deleteError}
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col bg-[#F8FAFC] rounded-2xl overflow-hidden border border-slate-200 animate-pulse"
            >
              <div className="aspect-video w-full bg-slate-200/80" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200/80 rounded w-3/4" />
                <div className="h-3 bg-slate-200/60 rounded w-1/2" />
                <div className="h-2.5 bg-slate-200/40 rounded w-1/3 pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="max-w-md mx-auto py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#0F172A]">Failed to Load Playlists</h2>
          <p className="text-xs text-slate-600 mt-1">{error}</p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" size="sm" onClick={fetchPlaylists}>
              Try Again
            </Button>
          </div>
        </div>
      ) : playlists.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200/80 my-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">No Playlists Yet</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
            You haven't created any playlists yet. Group your favorite videos into custom playlists for easy watching.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
            >
              Create Your First Playlist
            </Button>
          </div>
        </div>
      ) : (
        /* Playlists Grid */
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
            <span>{playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'} found</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                isOwner={true}
                onDelete={handleDeletePlaylist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  );
}
