import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ListPlus,
  Check,
  Plus,
  Loader2,
  AlertCircle,
  FolderPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getUserPlaylists,
  addVideoToPlaylist,
  createPlaylist,
} from '../../api/playlist.api';
import Button from '../common/Button';

/**
 * Modal dialog on the Watch page allowing users to add the active video to their playlists.
 * Conforms to VideoTube's purple light theme.
 */
export default function AddToPlaylistModal({ isOpen, onClose, videoId, videoTitle }) {
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Track adding operation for specific playlist ID
  const [addingPlaylistId, setAddingPlaylistId] = useState(null);

  // Quick-create state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newError, setNewError] = useState('');

  // Fetch current user playlists
  const fetchPlaylists = useCallback(async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await getUserPlaylists(user._id);
      const list = Array.isArray(res?.data) ? res.data : [];
      setPlaylists(list);
    } catch (err) {
      setError('Failed to load your playlists.');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
      setSuccessMessage('');
      setError('');
      setIsCreatingNew(false);
      setNewName('');
      setNewDescription('');
    }
  }, [isOpen, fetchPlaylists]);

  if (!isOpen) return null;

  // Add video to existing playlist
  const handleAddToPlaylist = async (playlist) => {
    const isAlreadyIn = playlist.videos?.some(
      (v) => (v._id || v).toString() === videoId?.toString()
    );

    if (isAlreadyIn) {
      setSuccessMessage(`Video is already in "${playlist.name}"`);
      return;
    }

    try {
      setAddingPlaylistId(playlist._id);
      setError('');
      setSuccessMessage('');

      await addVideoToPlaylist(videoId, playlist._id);

      // Update local state to mark as added
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p._id === playlist._id) {
            return {
              ...p,
              videos: [...(p.videos || []), { _id: videoId }],
            };
          }
          return p;
        })
      );

      setSuccessMessage(`Added to "${playlist.name}"!`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to add video to playlist.'
      );
    } finally {
      setAddingPlaylistId(null);
    }
  };

  // Create new playlist and immediately add this video to it
  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setNewError('Playlist name is required.');
      return;
    }
    if (!newDescription.trim()) {
      setNewError('Playlist description is required.');
      return;
    }

    try {
      setIsSubmittingNew(true);
      setNewError('');

      // 1. Create playlist
      const createRes = await createPlaylist({
        name: newName.trim(),
        description: newDescription.trim(),
      });
      const newPlaylist = createRes?.data;

      if (!newPlaylist?._id) {
        throw new Error('Playlist created, but missing ID.');
      }

      // 2. Add video to newly created playlist
      await addVideoToPlaylist(videoId, newPlaylist._id);

      setPlaylists((prev) => [
        {
          ...newPlaylist,
          videos: [{ _id: videoId }],
        },
        ...prev,
      ]);

      setSuccessMessage(`Created and added to "${newName.trim()}"!`);
      setNewName('');
      setNewDescription('');
      setIsCreatingNew(false);
    } catch (err) {
      setNewError(
        err.response?.data?.message || err.message || 'Failed to create playlist.'
      );
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-playlist-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 id="add-to-playlist-title" className="text-sm font-bold text-[#0F172A]">
                Save Video to Playlist
              </h3>
              {videoTitle && (
                <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[260px]">
                  {videoTitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-700">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
              <p className="text-xs text-slate-500">Loading your playlists...</p>
            </div>
          ) : playlists.length === 0 && !isCreatingNew ? (
            <div className="py-6 text-center">
              <ListPlus className="w-10 h-10 text-purple-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#0F172A]">No playlists yet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Create your first playlist below to save this video.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Your Playlists
              </p>
              {playlists.map((playlist) => {
                const isAlreadyIn = playlist.videos?.some(
                  (v) => (v._id || v).toString() === videoId?.toString()
                );
                const isAdding = addingPlaylistId === playlist._id;

                return (
                  <button
                    key={playlist._id}
                    type="button"
                    onClick={() => handleAddToPlaylist(playlist)}
                    disabled={isAdding}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer
                      ${
                        isAlreadyIn
                          ? 'bg-purple-50/70 border-purple-200 text-[#7C3AED]'
                          : 'bg-[#F8FAFC] border-slate-200 hover:border-purple-300 hover:bg-[#EDE9FE]/50 text-[#0F172A]'
                      }
                    `}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold truncate">{playlist.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {playlist.videos?.length || 0} {playlist.videos?.length === 1 ? 'video' : 'videos'}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
                      ) : isAlreadyIn ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED] bg-white px-2 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                          <Check className="w-3.5 h-3.5" />
                          Added
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#7C3AED] hover:border-purple-300">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Inline Create New Playlist Section */}
          <div className="pt-2 border-t border-slate-100">
            {!isCreatingNew ? (
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#7C3AED] bg-purple-50 hover:bg-[#EDE9FE] transition-colors border border-purple-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Playlist</span>
              </button>
            ) : (
              <form onSubmit={handleCreateAndAdd} className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">
                    New Playlist Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {newError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    {newError}
                  </p>
                )}

                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Playlist name"
                  maxLength={100}
                  required
                  className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED]"
                />

                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Playlist description"
                  rows={2}
                  maxLength={300}
                  required
                  className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] resize-none"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingNew(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingNew}
                  >
                    {isSubmittingNew ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Create & Add'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-slate-100 flex justify-end flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
