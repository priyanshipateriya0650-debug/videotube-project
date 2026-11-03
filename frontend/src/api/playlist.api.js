import axiosInstance from './axiosInstance';

/**
 * Playlists API client matching verified backend routes under /api/v1/playlists.
 */

// Fetch playlists created by a specific user
export const getUserPlaylists = async (userId) => {
  const response = await axiosInstance.get(`/playlists/user/${userId}`);
  return response.data;
};

// Fetch playlist details by ID (including populated videos)
export const getPlaylistById = async (playlistId) => {
  const response = await axiosInstance.get(`/playlists/${playlistId}`);
  return response.data;
};

// Create a new playlist
export const createPlaylist = async ({ name, description }) => {
  const response = await axiosInstance.post('/playlists', {
    name,
    description,
  });
  return response.data;
};

// Update playlist details (name, description)
export const updatePlaylist = async (playlistId, { name, description }) => {
  const response = await axiosInstance.patch(`/playlists/${playlistId}`, {
    name,
    description,
  });
  return response.data;
};

// Delete a playlist by ID
export const deletePlaylist = async (playlistId) => {
  const response = await axiosInstance.delete(`/playlists/${playlistId}`);
  return response.data;
};

// Add a video to a playlist: PATCH /playlists/add/:videoId/:playlistId
export const addVideoToPlaylist = async (videoId, playlistId) => {
  const response = await axiosInstance.patch(`/playlists/add/${videoId}/${playlistId}`);
  return response.data;
};

// Remove a video from a playlist: PATCH /playlists/remove/:videoId/:playlistId
export const removeVideoFromPlaylist = async (videoId, playlistId) => {
  const response = await axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);
  return response.data;
};
