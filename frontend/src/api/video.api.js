import axiosInstance from './axiosInstance';

/**
 * Video API services matching confirmed backend routes under /api/v1/videos.
 */

// Fetch a single video by ID (increments views & updates watch history on backend)
export const getVideoById = async (videoId) => {
  const response = await axiosInstance.get(`/videos/${videoId}`);
  return response.data;
};

// Fetch all published videos with optional filters (query, pagination, sort, userId)
export const getAllVideos = async (params = {}) => {
  const response = await axiosInstance.get('/videos', { params });
  return response.data;
};

// Publish a new video (multipart form data with upload progress tracking)
export const publishVideo = async (formData, onUploadProgress) => {
  const response = await axiosInstance.post('/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

// Update video metadata and/or thumbnail
export const updateVideo = async (videoId, formData, onUploadProgress) => {
  const response = await axiosInstance.patch(`/videos/${videoId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

// Delete video by ID
export const deleteVideo = async (videoId) => {
  const response = await axiosInstance.delete(`/videos/${videoId}`);
  return response.data;
};

// Toggle video publish status
export const togglePublishStatus = async (videoId) => {
  const response = await axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
  return response.data;
};
