import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please check your email/password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !organizationName) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup({ name, email, password, organizationName });
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFastTrackDemo = async () => {
    setDemoLoading(true);
    setError('');
    try {
      await login({ email: 'test@klypup.com', password: 'password123' });
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Fast Track Demo failed. Please try signing up.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Center Auth Card (Matching User's Screenshot) */}
      <div className="relative w-full max-w-md bg-white text-zinc-900 rounded-2xl shadow-2xl p-8 z-10 border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {mode === 'signin' ? 'Access Dashboard' : 'Create Organization'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
            {mode === 'signin' 
              ? 'Sign in with your analyst credentials to manage your workspace.'
              : 'Register a new institutional equity research workspace.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@firm.com"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For developer mode, please use test@klypup.com / password123 or Fast Track Demo.')}
                  className="text-xs text-zinc-400 hover:text-zinc-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Fast Track Developer Demo Button (Exact from Screenshot) */}
              <button
                type="button"
                onClick={handleFastTrackDemo}
                disabled={demoLoading || loading}
                className="w-full py-2.5 border-2 border-dashed border-zinc-300 hover:border-zinc-500 bg-white hover:bg-zinc-50 disabled:opacity-60 text-zinc-800 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {demoLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>Connecting to Demo Workspace...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Fast Track Developer Demo</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
              Don't have an organization?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('signup');
                }}
                className="font-bold text-zinc-900 hover:underline"
              >
                Create one now
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP / CREATE ORG FORM */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Organization / Firm Name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Citadel Alpha Corp"
                required
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@firm.com"
                required
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Organization Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFastTrackDemo}
                disabled={demoLoading || loading}
                className="w-full py-2 border border-dashed border-zinc-300 hover:border-zinc-500 bg-white disabled:opacity-60 text-zinc-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {demoLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    <span>Connecting to Demo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Fast Track Developer Demo</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-100 text-center text-xs text-zinc-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('signin');
                }}
                className="font-bold text-zinc-900 hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
