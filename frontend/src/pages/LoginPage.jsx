import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PlaySquare, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Can be username or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!identifier.trim()) {
      setLocalError('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    // Determine if identifier is an email or username
    const isEmail = identifier.includes('@');
    const credentials = {
      username: isEmail ? undefined : identifier.trim().toLowerCase(),
      email: isEmail ? identifier.trim().toLowerCase() : undefined,
      password,
    };

    const res = await login(credentials);
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setLocalError(res.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <PlaySquare className="w-6 h-6 fill-white stroke-[#7C3AED]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Video<span className="text-[#7C3AED]">Tube</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[#0F172A]">Sign in to your account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your subscriptions, playlists, and channel studio
          </p>
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{localError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. johndoe or user@example.com"
                className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm"
                autoComplete="username"
                disabled={isSubmitting}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#F8FAFC] text-[#0F172A] placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-1 focus:ring-[#7C3AED] transition-all text-sm"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#7C3AED] font-semibold hover:underline hover:text-[#6D28D9] transition-colors"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
