import React, { useRef, useState } from 'react';
import { AlertCircle, Film } from 'lucide-react';

/**
 * Responsive HTML5 Video Player with controls, volume, seeking, and error fallback.
 */
export default function VideoPlayer({ src, poster, title }) {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = () => {
    setHasError(true);
    setErrorMessage('Unable to play this video. The media source may be unavailable or invalid.');
  };

  if (!src || hasError) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white border border-slate-800">
        <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 text-purple-400">
          <AlertCircle className="w-7 h-7 text-purple-400" />
        </div>
        <h3 className="text-base font-semibold text-white">Video Unavailable</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          {errorMessage || 'No video streaming source was provided for this item.'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onError={handleError}
        className="w-full h-full object-contain bg-black focus:outline-none"
      >
        <p className="text-white text-xs p-4">
          Your browser does not support the video tag. Please try using a modern web browser.
        </p>
      </video>
    </div>
  );
}
