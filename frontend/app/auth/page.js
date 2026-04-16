'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const saveSession = data => {
    window.localStorage.setItem('authToken', data.token);
    window.localStorage.setItem('currentTenant', JSON.stringify(data.tenant));
    router.push('/dashboard');
  };

  const handleLogin = async event => {
    event.preventDefault();
    setError(null);
    setStatus('Signing in...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || 'Login failed');
        setStatus(null);
        return;
      }
      saveSession(data);
    } catch (err) {
      console.error(err);
      setError('Unable to sign in.');
      setStatus(null);
    }
  };

  const handleSignup = async event => {
    event.preventDefault();
    setError(null);
    setStatus('Creating your account...');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: { email, password }
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || 'Signup failed');
        setStatus(null);
        return;
      }
      saveSession(data);
    } catch (err) {
      console.error(err);
      setError('Unable to create your account.');
      setStatus(null);
    }
  };

  return (
    <main className="container py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-bold">{mode === 'login' ? 'Owner Login' : 'Create Owner Account'}</h1>
        <p className="mt-3 text-slate-600">
          {mode === 'login'
            ? 'Sign in first, then you can create or edit only your own website.'
            : 'Create your account first. After login, you will create your website from the dashboard.'}
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setStatus(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setStatus(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="mt-8 space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value.toLowerCase())}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />
          </label>
          <button type="submit" className="w-full rounded-full bg-primary px-6 py-3 text-white">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          {status && <p className="text-sm text-green-700">{status}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Flow</p>
          <p className="mt-2">1. Login or sign up.</p>
          <p>2. Open dashboard and create your website.</p>
          <p>3. Login later anytime to edit only your own website.</p>
        </div>

        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-primary">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
