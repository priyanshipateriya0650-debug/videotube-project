import React, { useState, useEffect } from 'react';
import { X, Edit3, Image as ImageIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import { updateVideo } from '../../api/video.api';

/**
 * Edit Video Modal:
 * Allows partial updates to title, description, and thumbnail without requiring
 * every field to be re-entered. Preserves existing values when unchanged.
 */
export default function EditVideoModal({
  isOpen,
  onClose,
  video,
  onVideoUpdated,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill fields when modal opens with a video
  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setThumbnailFile(null);
      setThumbnailPreview(video.thumbnail || '');
      setError('');
      setSuccess('');
      setUploadProgress(0);
    }
  }, [video, isOpen]);

  // Clean up thumbnail blob preview URL if generated
  useEffect(() => {
    return () => {
      if (thumbnailFile && thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailFile, thumbnailPreview]);

  if (!isOpen || !video) return null;

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file for thumbnail (PNG, JPG, WEBP).');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleResetThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(video.thumbnail || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      setError('Title cannot be empty.');
      return;
    }
    if (!trimmedDesc) {
      setError('Description cannot be empty.');
      return;
    }

    // Check if anything actually changed
    const titleChanged = trimmedTitle !== video.title;
    const descChanged = trimmedDesc !== video.description;
    const thumbnailChanged = thumbnailFile !== null;

    if (!titleChanged && !descChanged && !thumbnailChanged) {
      setError('No changes were made.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      setUploadProgress(0);

      const formData = new FormData();
      if (titleChanged) formData.append('title', trimmedTitle);
      if (descChanged) formData.append('description', trimmedDesc);
      if (thumbnailChanged) formData.append('thumbnail', thumbnailFile);

      const res = await updateVideo(video._id, formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      const updated = res?.data || {
        ...video,
        ...(titleChanged ? { title: trimmedTitle } : {}),
        ...(descChanged ? { description: trimmedDesc } : {}),
        ...(thumbnailChanged && thumbnailPreview ? { thumbnail: thumbnailPreview } : {}),
      };

      setSuccess('Video updated successfully!');
      setTimeout(() => {
        if (onVideoUpdated) onVideoUpdated(updated);
        onClose();
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update video. Please check your network and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-video-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 id="edit-video-title" className="text-base font-bold text-[#0F172A]">
              Edit Video Details
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Title <span className="text-[#7C3AED]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive video title"
              maxLength={120}
              disabled={isSubmitting}
              className="w-full bg-[#F8FAFC] text-[#0F172A] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#7C3AED] focus:bg-white text-sm"
              required
            />
            <div className="text-right text-[11px] text-slate-400 mt-1">
              {title.length}/120
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description <span className="text-[#7C3AED]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers what your video is about"
              rows={4}
              maxLength={5000}
              disabled={isSubmitting}
              className="w-full bg-[#F8FAFC] text-[#0F172A] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#7C3AED] focus:bg-white text-sm resize-none"
              required
            />
            <div className="text-right text-[11px] text-slate-400 mt-1">
              {description.length}/5000
            </div>
          </div>

          {/* Thumbnail Preview & Replacement */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Thumbnail
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
              {thumbnailPreview ? (
                <div className="relative group w-36 h-20 rounded-lg overflow-hidden border border-slate-300 flex-shrink-0 bg-slate-900">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  {thumbnailFile && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#7C3AED] text-white text-[10px] font-semibold rounded">
                      New
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-36 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <p className="text-xs text-slate-600 font-medium">
                  {thumbnailFile
                    ? `Selected: ${thumbnailFile.name}`
                    : 'Current thumbnail is preserved unless replaced.'}
                </p>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EDE9FE] hover:text-[#7C3AED] text-slate-700 text-xs font-medium rounded-lg border border-slate-300 cursor-pointer transition-colors">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{thumbnailFile ? 'Change Image' : 'Replace Thumbnail'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                  {thumbnailFile && (
                    <button
                      type="button"
                      onClick={handleResetThumbnail}
                      disabled={isSubmitting}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar if upload is active */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Saving changes...</span>
                <span className="font-semibold text-[#7C3AED]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
