import React, { useState } from 'react';
import { X, ListPlus, Loader2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { createPlaylist } from '../../api/playlist.api';

/**
 * Modal dialog for creating a new playlist.
 * Follows VideoTube's purple light theme.
 */
export default function CreatePlaylistModal({ isOpen, onClose, onPlaylistCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Playlist name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Playlist description is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await createPlaylist({
        name: name.trim(),
        description: description.trim(),
      });

      const newPlaylist = res?.data;
      if (onPlaylistCreated) {
        onPlaylistCreated(newPlaylist);
      }
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to create playlist. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-playlist-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <ListPlus className="w-4 h-4" />
            </div>
            <h3 id="create-playlist-title" className="text-base font-bold text-[#0F172A]">
              Create New Playlist
            </h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Playlist Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Favorite Coding Tutorials"
              maxLength={100}
              required
              className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this playlist is about..."
              rows={3}
              maxLength={500}
              required
              className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] text-sm transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Playlist'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
