import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import HomePage from '../pages/HomePage';
import WatchPage from '../pages/WatchPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ChannelPage from '../pages/ChannelPage';
import SettingsPage from '../pages/SettingsPage';
import PlaylistsPage from '../pages/PlaylistsPage';
import PlaylistDetailPage from '../pages/PlaylistDetailPage';
import LikedVideosPage from '../pages/LikedVideosPage';
import WatchHistoryPage from '../pages/WatchHistoryPage';
import TweetsPage from '../pages/TweetsPage';
import StudioPage from '../pages/StudioPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Standalone Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main App Layout */}
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/watch/:videoId" element={<WatchPage />} />
        <Route path="/c/:username" element={<ChannelPage />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <PlaceholderPage
              title="Subscriptions"
              description="Stay updated with the latest uploads from all your subscribed channels."
            />
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <WatchHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked"
          element={
            <ProtectedRoute>
              <LikedVideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked-videos"
          element={
            <ProtectedRoute>
              <LikedVideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <PlaylistsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlist/:playlistId"
          element={
            <ProtectedRoute>
              <PlaylistDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/:playlistId"
          element={
            <ProtectedRoute>
              <PlaylistDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/tweets" element={<TweetsPage />} />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Navigate to="/studio?upload=true" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Page Not Found"
              description="The page you are looking for does not exist or has been moved."
              badge="404"
            />
          }
        />
      </Route>
    </Routes>
  );
}
