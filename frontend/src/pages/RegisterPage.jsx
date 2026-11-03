import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlaySquare,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setLocalError('Please select a valid image file for the avatar.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setLocalError('');
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setLocalError('Please select a valid image file for the cover image.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setLocalError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Validations
    if (!formData.fullName.trim()) {
      setLocalError('Full name is required.');
      return;
    }
    if (!formData.username.trim()) {
      setLocalError('Username is required.');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('Email address is required.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (!avatarFile) {
      setLocalError('An avatar image is required by VideoTube.');
      return;
    }

    setIsSubmitting(true);

    // Build multipart FormData
    const submissionData = new FormData();
    submissionData.append('fullName', formData.fullName.trim());
    submissionData.append('username', formData.username.trim().toLowerCase());
    submissionData.append('email', formData.email.trim().toLowerCase());
    submissionData.append('password', formData.password);
    submissionData.append('avatar', avatarFile);

    if (coverFile) {
      submissionData.append('coverImage', coverFile);
    }

    const res = await register(submissionData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Account created successfully! Signing you in...');
      // Auto login after registration
      const loginRes = await login({
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
      });

      if (loginRes.success) {
        navigate('/', { replace: true });
      } else {
        setTimeout(() => navigate('/login'), 1500);
      }
    } else {
      setLocalError(res.error || 'Registration failed. Please check the provided details.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <PlaySquare className="w-6 h-6 fill-white stroke-[#7C3AED]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Video<span className="text-[#7C3AED]">Tube</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[#0F172A]">Create your channel account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Join VideoTube to share videos, create playlists, and join the community
          </p>
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{localError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5 text-xs text-green-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images Section (Avatar & Cover) */}
          <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Profile Media
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Avatar Upload (Required) */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Avatar Image <span className="text-[#7C3AED]">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-purple-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EDE9FE] text-[#7C3AED] border border-purple-200 rounded-lg text-xs font-medium transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {avatarFile ? 'Change' : 'Upload Avatar'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Cover Image Upload (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Cover Banner <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EDE9FE] text-slate-700 hover:text-[#7C3AED] border border-slate-200 rounded-lg text-xs font-medium transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {coverFile ? 'Change' : 'Upload Banner'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g. johndoe"
                  className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm"
                  required
                />
                <span className="text-xs font-semibold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  @
                </span>
              </div>
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
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Choose a secure password (min 6 chars)"
                className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 mt-2 font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#7C3AED] font-semibold hover:underline hover:text-[#6D28D9] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
