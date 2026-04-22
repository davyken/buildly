import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Button, Input } from '../components/ui';

const BrandMark = () => (
  <div className="flex items-center gap-2.5 mb-8">
    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="black" />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="black" opacity="0.6" />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="black" opacity="0.4" />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="black" opacity="0.2" />
      </svg>
    </div>
    <span className="font-display font-bold text-xl text-text tracking-tight">Buildly</span>
  </div>
);

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface border-r border-border p-12 flex-col justify-between">
        <div className="absolute inset-0 canvas-grid opacity-60" />
        <div className="relative z-10">
          <BrandMark />
          <div className="mt-16">
            <h1 className="font-display text-4xl font-bold text-text leading-tight text-balance">
              Build beautiful websites.<br />
              <span className="text-accent">No code required.</span>
            </h1>
            <p className="mt-4 text-text-dim text-lg">
              Drag, drop, and publish — your website live in minutes.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex gap-6 text-sm text-muted">
          <span>✦ Drag & Drop Editor</span>
          <span>✦ Custom Domains</span>
          <span>✦ Contact Forms</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden mb-8"><BrandMark /></div>
          <h2 className="font-display text-2xl font-bold text-text mb-1">Sign in</h2>
          <p className="text-text-dim text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button variant="accent" size="lg" loading={loading} type="submit" className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-dim">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-dim transition-colors font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      const { data } = await authApi.register(email, password, name);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Account created! Welcome to Buildly 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <BrandMark />
        <h2 className="font-display text-2xl font-bold text-text mb-1">Create your account</h2>
        <p className="text-text-dim text-sm mb-8">Free plan — 1 site, no card required</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Your Name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button variant="accent" size="lg" loading={loading} type="submit" className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-dim">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-dim transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
