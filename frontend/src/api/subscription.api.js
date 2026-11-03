import axiosInstance from './axiosInstance';

/**
 * Subscriptions API services matching confirmed backend routes under /api/v1/subscriptions.
 */

// Toggle subscription to a channel
export const toggleSubscription = async (channelId) => {
  const response = await axiosInstance.post(`/subscriptions/c/${channelId}`);
  return response.data;
};

// Get list of subscribers for a channel
export const getChannelSubscribers = async (channelId) => {
  const response = await axiosInstance.get(`/subscriptions/c/${channelId}`);
  return response.data;
};

// Get list of channels the user is subscribed to
export const getSubscribedChannels = async (subscriberId) => {
  const response = await axiosInstance.get(`/subscriptions/u/${subscriberId}`);
  return response.data;
};
