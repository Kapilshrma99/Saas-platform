'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

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
      window.localStorage.setItem('authToken', data.token);
      window.localStorage.setItem('currentTenant', JSON.stringify(data.tenant));
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Unable to sign in.');
      setStatus(null);
    }
  };

  return (
    <main className="container py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-bold">Owner Login</h1>
        <p className="mt-3 text-slate-600">Sign in to manage your website content and theme.</p>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
            Sign In
          </button>
          {status && <p className="text-sm text-green-700">{status}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      </div>
    </main>
  );
}
