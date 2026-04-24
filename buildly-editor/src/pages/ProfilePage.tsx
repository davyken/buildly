import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '../components/ui';
import { User, Mail, Shield, Zap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text">Profile & Settings</h1>
        <p className="text-text-dim mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Personal Info */}
        <Card className="bg-surface border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} className="text-accent" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={user?.name || ''}
                readOnly
                disabled
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                readOnly
                disabled
                icon={<Mail size={14} />}
              />
            </div>
            <p className="text-xs text-muted">Personal details are currently read-only. Contact support to change them.</p>
          </CardContent>
        </Card>

        {/* Plan & Billing */}
        <Card className="bg-surface border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={18} className="text-accent" />
              Subscription Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield size={24} className="text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-text">{user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</h4>
                  <Badge variant={user?.plan === 'pro' ? 'green' : 'default'}>
                    {user?.plan === 'pro' ? 'Active' : 'Current'}
                  </Badge>
                </div>
                <p className="text-sm text-text-dim">
                  {user?.plan === 'pro' 
                    ? 'You have access to all premium features.' 
                    : 'Upgrade to Pro for custom domains and unlimited sites.'}
                </p>
              </div>
            </div>
            {user?.plan !== 'pro' && (
              <Button variant="accent" size="sm">Upgrade to Pro</Button>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-surface border-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-text">Sign out of account</h4>
                <p className="text-sm text-text-dim">You will be redirected to the login page.</p>
              </div>
              <Button variant="danger" size="sm" onClick={handleLogout} icon={<LogOut size={14} />}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};