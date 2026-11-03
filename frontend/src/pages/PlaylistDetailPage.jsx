import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ListVideo,
  Play,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowLeft,
  VideoOff,
  Clock,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getPlaylistById,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from '../api/playlist.api';
import Button from '../components/common/Button';
import { formatDuration, formatViews, formatRelativeTime } from '../utils/formatters';

/**
 * Playlist Details Page.
 * Displays playlist metadata, video list, and owner management actions (edit, remove, delete).
 * Follows VideoTube's purple light theme.
 */
export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Video removal state
  const [removingVideoId, setRemovingVideoId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Edit playlist state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch playlist data
  const fetchPlaylist = useCallback(async () => {
    if (!playlistId) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await getPlaylistById(playlistId);
      const data = res?.data;

      if (data) {
        setPlaylist(data);
        setEditName(data.name || '');
        setEditDescription(data.description || '');
      } else {
        setError('Playlist not found.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('This playlist does not exist or has been removed.');
      } else {
        setError(err.response?.data?.message || 'Failed to load playlist.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylist();
    window.scrollTo(0, 0);
  }, [fetchPlaylist]);

  // Check if current authenticated user owns this playlist
  const isOwner =
    user &&
    playlist &&
    (playlist.owner === user._id ||
      playlist.owner?._id === user._id ||
      playlist.owner?.toString() === user._id?.toString());

  // Remove video from playlist
  const handleRemoveVideo = async (videoId, videoTitle) => {
    try {
      setRemovingVideoId(videoId);
      setActionError('');
      setActionSuccess('');

      await removeVideoFromPlaylist(videoId, playlistId);

      // Update state immediately
      setPlaylist((prev) => ({
        ...prev,
        videos: (prev.videos || []).filter((v) => (v._id || v) !== videoId),
      }));

      setActionSuccess(`Removed "${videoTitle || 'video'}" from playlist.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(
        err.response?.data?.message || 'Failed to remove video from playlist.'
      );
    } finally {
      setRemovingVideoId(null);
    }
  };

  // Delete entire playlist
  const handleDeletePlaylist = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${playlist?.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deletePlaylist(playlistId);
      navigate('/playlists');
    } catch (err) {
      setActionError(
        err.response?.data?.message || 'Failed to delete playlist.'
      );
    }
  };

  // Update playlist title/description
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setActionError('Playlist name is required.');
      return;
    }
    if (!editDescription.trim()) {
      setActionError('Playlist description is required.');
      return;
    }

    try {
      setIsSavingEdit(true);
      setActionError('');
      const res = await updatePlaylist(playlistId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      if (res?.data) {
        setPlaylist((prev) => ({
          ...prev,
          name: res.data.name || editName.trim(),
          description: res.data.description || editDescription.trim(),
        }));
      }

      setIsEditing(false);
      setActionSuccess('Playlist updated successfully!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(
        err.response?.data?.message || 'Failed to update playlist.'
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading playlist...</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-4 border border-purple-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">Playlist Unavailable</h1>
        <p className="text-slate-600 text-sm mt-2">{error || 'This playlist could not be found.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/playlists">
            <Button variant="primary">Back to Playlists</Button>
          </Link>
        </div>
      </div>
    );
  }

  const videos = Array.isArray(playlist.videos) ? playlist.videos : [];
  const firstVideo = videos[0];
  const coverThumbnail = firstVideo?.thumbnail;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Back navigation */}
      <div>
        <Link
          to="/playlists"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#7C3AED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Playlists</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs text-green-700">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Layout: Left info column, Right video list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Playlist Card & Details */}
        <div className="lg:col-span-4 bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 space-y-5 sticky top-20">
          {/* Cover Image / Gradient */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-200/80 relative shadow-xs">
            {coverThumbnail ? (
              <img
                src={coverThumbnail}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-slate-100 text-[#7C3AED]">
                <ListVideo className="w-12 h-12 opacity-80 mb-1" />
                <span className="text-xs font-semibold text-purple-700">Empty Playlist</span>
              </div>
            )}

            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow">
              <ListVideo className="w-3.5 h-3.5" />
              <span>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
            </div>
          </div>

          {/* Playlist Info or Edit Form */}
          {!isEditing ? (
            <div className="space-y-3">
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] leading-tight">
                  {playlist.name}
                </h1>
                <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">
                  {playlist.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {playlist.createdAt ? formatRelativeTime(playlist.createdAt) : 'Recently'}
                </span>
                <span>&bull;</span>
                <span>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                {firstVideo && (
                  <Link to={`/watch/${firstVideo._id || firstVideo.id}`}>
                    <Button variant="primary" className="w-full" icon={Play}>
                      Play All
                    </Button>
                  </Link>
                )}

                {isOwner && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex-1"
                      icon={Edit2}
                    >
                      Edit Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeletePlaylist}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Edit Playlist
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={100}
                  required
                  className="w-full bg-white text-[#0F172A] px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                  required
                  className="w-full bg-white text-[#0F172A] px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Videos List */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-base font-bold text-[#0F172A]">
              Playlist Videos ({videos.length})
            </h2>
          </div>

          {videos.length === 0 ? (
            /* Empty Video State */
            <div className="py-16 px-4 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200/80">
              <VideoOff className="w-12 h-12 text-purple-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#0F172A]">This playlist is empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No videos have been added to this playlist yet. Explore videos and click the "Save" button to add them here.
              </p>
              <div className="mt-5">
                <Link to="/">
                  <Button variant="primary" size="sm">
                    Explore Videos
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Video List Rows */
            <div className="space-y-2.5">
              {videos.map((video, idx) => {
                const videoId = video._id || video.id;
                const channelName =
                  video.owner?.fullName ||
                  video.owner?.username ||
                  'VideoTube Creator';
                const channelAvatar = video.owner?.avatar;
                const isRemoving = removingVideoId === videoId;

                return (
                  <div
                    key={videoId || idx}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 bg-[#F8FAFC] hover:bg-[#EDE9FE]/40 rounded-xl border border-slate-200/80 hover:border-purple-300 transition-all duration-150"
                  >
                    {/* Index Number */}
                    <span className="hidden sm:inline-block w-6 text-center text-xs font-bold text-slate-400 group-hover:text-[#7C3AED]">
                      {idx + 1}
                    </span>

                    {/* Thumbnail */}
                    <Link
                      to={`/watch/${videoId}`}
                      className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 block"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {typeof video.duration === 'number' && (
                        <span className="absolute bottom-1.5 right-1.5 bg-slate-900/85 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                    </Link>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0 pr-2">
                      <Link to={`/watch/${videoId}`} className="block">
                        <h4 className="text-sm font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#7C3AED] transition-colors leading-snug">
                          {video.title}
                        </h4>
                      </Link>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        {video.owner?.username ? (
                          <Link
                            to={`/c/${video.owner.username}`}
                            className="font-medium text-slate-700 hover:text-[#7C3AED] truncate flex items-center gap-1.5"
                          >
                            {channelAvatar && (
                              <img
                                src={channelAvatar}
                                alt={channelName}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            )}
                            <span className="truncate">{channelName}</span>
                          </Link>
                        ) : (
                          <span className="truncate">{channelName}</span>
                        )}

                        {typeof video.views === 'number' && (
                          <>
                            <span>&bull;</span>
                            <span>{formatViews(video.views)} views</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions: Remove Video */}
                    {isOwner && (
                      <div className="flex-shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(videoId, video.title)}
                          disabled={isRemoving}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove from playlist"
                          aria-label={`Remove ${video.title} from playlist`}
                        >
                          {isRemoving ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
