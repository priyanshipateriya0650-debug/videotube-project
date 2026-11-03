import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import Button from '../common/Button';

/**
 * Confirmation modal for deleting a video permanently.
 */
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  video,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-[#0F172A]">
              Delete Video
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this video? This action is permanent and cannot be undone. The video and thumbnail will be removed from Cloudinary and the database.
          </p>

          {/* Video preview snippet */}
          <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-16 h-10 object-cover rounded-md flex-shrink-0 bg-slate-200"
              />
            ) : (
              <div className="w-16 h-10 bg-slate-200 rounded-md flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#0F172A] line-clamp-1">
                {video.title}
              </p>
              <p className="text-[11px] text-slate-400">
                Uploaded {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-[#F8FAFC]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <button
            type="button"
            onClick={() => onConfirm(video._id)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg text-xs px-3 py-1.5 gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Forever
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
