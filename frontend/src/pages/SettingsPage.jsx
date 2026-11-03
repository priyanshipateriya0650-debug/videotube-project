import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Palette,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  changePassword,
} from '../api/auth.api';
import Button from '../components/common/Button';

export default function SettingsPage() {
  const { user, updateUserState, checkSession } = useAuth();

  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'branding' | 'security'

  // Account details state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  // Cover image state
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverSuccess, setCoverSuccess] = useState('');
  const [coverError, setCoverError] = useState('');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Synchronize form when user state loads or updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // 1. Handle Account Details Update
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    if (!fullName.trim()) {
      setAccountError('Full name cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setAccountError('Please provide a valid email address.');
      return;
    }

    try {
      setIsSavingAccount(true);
      await updateAccountDetails({
        fullName: fullName.trim(),
        email: email.trim(),
      });
      updateUserState({ fullName: fullName.trim(), email: email.trim() });
      setAccountSuccess('Account information updated successfully!');
    } catch (err) {
      setAccountError(
        err.response?.data?.message || 'Failed to update account information.'
      );
    } finally {
      setIsSavingAccount(false);
    }
  };

  // 2. Handle Avatar Selection & Upload
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError('');
    setAvatarSuccess('');
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || isUploadingAvatar) return;

    try {
      setIsUploadingAvatar(true);
      setAvatarError('');
      setAvatarSuccess('');

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await updateUserAvatar(formData);
      const updatedUser = res?.data || res;
      const newAvatarUrl = updatedUser?.avatar;

      // Ensure the backend returned a real updated avatar URL
      if (!newAvatarUrl) {
        throw new Error('Upload succeeded on server, but no avatar URL was returned.');
      }

      updateUserState({ avatar: newAvatarUrl });
      setAvatarSuccess('Avatar updated successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
      if (checkSession) await checkSession();
    } catch (err) {
      setAvatarError(err.response?.data?.message || err.message || 'Failed to upload new avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 3. Handle Cover Image Selection & Upload
  const handleCoverFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCoverError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverError('');
    setCoverSuccess('');
  };

  const handleUploadCover = async () => {
    if (!coverFile || isUploadingCover) return;

    try {
      setIsUploadingCover(true);
      setCoverError('');
      setCoverSuccess('');

      const formData = new FormData();
      formData.append('coverImage', coverFile);

      const res = await updateUserCoverImage(formData);
      const updatedUser = res?.data || res;
      const newCoverUrl = updatedUser?.coverImage;

      // Ensure the backend returned a real updated cover image URL
      if (!newCoverUrl) {
        throw new Error('Upload succeeded on server, but no cover image URL was returned.');
      }

      updateUserState({ coverImage: newCoverUrl });
      setCoverSuccess('Cover banner updated successfully!');
      setCoverFile(null);
      setCoverPreview(null);
      if (checkSession) await checkSession();
    } catch (err) {
      setCoverError(err.response?.data?.message || err.message || 'Failed to upload new cover banner.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // 4. Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      await changePassword({ oldPassword, newPassword });
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Failed to change password. Verify your current password.'
      );
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Channel & Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information, profile branding, and account security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`
            pb-3 px-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2
            ${
              activeTab === 'account'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-600 hover:text-[#7C3AED]'
            }
          `}
        >
          <User className="w-4 h-4" />
          <span>Account Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`
            pb-3 px-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2
            ${
              activeTab === 'branding'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-600 hover:text-[#7C3AED]'
            }
          `}
        >
          <Palette className="w-4 h-4" />
          <span>Branding & Images</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`
            pb-3 px-4 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px flex items-center gap-2
            ${
              activeTab === 'security'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-600 hover:text-[#7C3AED]'
            }
          `}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* Tab 1: Account Information */}
      {activeTab === 'account' && (
        <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Personal Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your display name and email address. Username cannot be modified.
            </p>
          </div>

          {accountSuccess && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{accountSuccess}</span>
            </div>
          )}

          {accountError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{accountError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateAccount} className="space-y-4 max-w-lg">
            {/* Username (Read Only) */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={user?.username ? `@${user.username}` : ''}
                  disabled
                  className="w-full bg-slate-100 text-slate-500 pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your channel URL is: {window.location.origin}/c/{user?.username}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white text-[#0F172A] placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] text-sm"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full bg-white text-[#0F172A] placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] text-sm"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSavingAccount}
              className="mt-2"
            >
              {isSavingAccount ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Tab 2: Branding & Images */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Avatar Update Card */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Channel Avatar</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your profile picture appears next to your videos, comments, and channel profile.
              </p>
            </div>

            {avatarSuccess && (
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{avatarSuccess}</span>
              </div>
            )}

            {avatarError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{avatarError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
              {/* Avatar Preview */}
              <div className="w-24 h-24 rounded-full bg-white border-2 border-purple-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="New avatar preview" className="w-full h-full object-cover" />
                ) : user?.avatar ? (
                  <img src={user.avatar} alt="Current avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EDE9FE] text-[#7C3AED] border border-purple-200 rounded-xl text-xs font-semibold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Choose Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileSelect}
                      className="hidden"
                    />
                  </label>

                  {avatarFile && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleUploadAvatar}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading...
                        </span>
                      ) : (
                        'Save New Avatar'
                      )}
                    </Button>
                  )}

                  {avatarFile && !isUploadingAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Recommended: Square JPG or PNG, at least 400x400 pixels.
                </p>
              </div>
            </div>
          </div>

          {/* Cover Banner Update Card */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Channel Cover Banner</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This image displays across the top of your channel page.
              </p>
            </div>

            {coverSuccess && (
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{coverSuccess}</span>
              </div>
            )}

            {coverError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{coverError}</span>
              </div>
            )}

            <div className="space-y-4 pt-2">
              {/* Cover Preview */}
              <div className="w-full h-32 sm:h-44 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                {coverPreview ? (
                  <img src={coverPreview} alt="New cover preview" className="w-full h-full object-cover" />
                ) : user?.coverImage ? (
                  <img src={user.coverImage} alt="Current banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">No cover image uploaded</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EDE9FE] text-slate-700 hover:text-[#7C3AED] border border-slate-200 rounded-xl text-xs font-semibold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Choose Banner
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileSelect}
                    className="hidden"
                  />
                </label>

                {coverFile && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleUploadCover}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      'Save New Banner'
                    )}
                  </Button>
                )}

                {coverFile && !isUploadingCover && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Recommended: 16:9 or 21:9 aspect ratio, at least 1920x1080 pixels for best resolution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Change Password</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your account uses a secure password of at least 6 characters.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-white text-[#0F172A] placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] text-sm"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-white text-[#0F172A] placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] text-sm"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-white text-[#0F172A] placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] text-sm"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isChangingPass}
              className="mt-2"
            >
              {isChangingPass ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </span>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
