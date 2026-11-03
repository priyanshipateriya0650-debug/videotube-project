import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileVideo,
} from 'lucide-react';
import Button from '../common/Button';
import { publishVideo } from '../../api/video.api';

/**
 * Upload Video Modal:
 * Handles video file selection, thumbnail image selection, title & description validation,
 * live upload progress tracking (0-100%), and error/success states.
 */
export default function UploadVideoModal({ isOpen, onClose, onSuccess }) {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  if (!isOpen) return null;

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file (MP4, WebM, MOV, etc.).');
        return;
      }
      setVideoFile(file);
      setError('');
      // Auto-populate title if empty based on file name (minus extension)
      if (!title) {
        const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(defaultTitle.charAt(0).toUpperCase() + defaultTitle.slice(1));
      }
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview('');
    setTitle('');
    setDescription('');
    setIsUploading(false);
    setUploadProgress(0);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    if (isUploading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select a video file to upload.');
      return;
    }
    if (!thumbnailFile) {
      setError('Please select a thumbnail image.');
      return;
    }
    if (!title.trim()) {
      setError('Video title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Video description is required.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnailFile);

      const res = await publishVideo(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setSuccess('Video uploaded and published successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess(res?.data);
        handleClose();
      }, 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Video upload failed. Please verify your connection and try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-video-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <h3 id="upload-video-title" className="text-base font-bold text-[#0F172A]">
              Upload New Video
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          {/* Video File Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Video File <span className="text-[#7C3AED]">*</span>
            </label>
            {videoFile ? (
              <div className="flex items-center justify-between p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center flex-shrink-0">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • {videoFile.type || 'video'}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      if (videoInputRef.current) videoInputRef.current.value = '';
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    aria-label="Remove selected video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#7C3AED] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#F8FAFC] hover:bg-purple-50/30 group"
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Click to select video or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  MP4, WebM, MOV, or AVI
                </p>
              </div>
            )}
          </div>

          {/* Thumbnail Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Thumbnail Image <span className="text-[#7C3AED]">*</span>
            </label>
            {thumbnailFile && thumbnailPreview ? (
              <div className="flex items-center justify-between p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-16 h-10 object-cover rounded-lg border border-purple-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">
                      {thumbnailFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(thumbnailFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview('');
                      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    aria-label="Remove selected thumbnail"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#7C3AED] rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#F8FAFC] hover:bg-purple-50/30 group"
              >
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Select thumbnail image
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  16:9 ratio recommended (JPG, PNG, WEBP)
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Title <span className="text-[#7C3AED]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title that describes your video"
              maxLength={120}
              disabled={isUploading}
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
              disabled={isUploading}
              className="w-full bg-[#F8FAFC] text-[#0F172A] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#7C3AED] focus:bg-white text-sm resize-none"
              required
            />
            <div className="text-right text-[11px] text-slate-400 mt-1">
              {description.length}/5000
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>
                  {uploadProgress === 100
                    ? 'Processing video on Cloudinary...'
                    : 'Uploading to Cloudinary...'}
                </span>
                <span className="text-[#7C3AED] font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUploading || !videoFile || !thumbnailFile || !title.trim() || !description.trim()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading ({uploadProgress}%)
                </>
              ) : (
                'Upload & Publish'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
