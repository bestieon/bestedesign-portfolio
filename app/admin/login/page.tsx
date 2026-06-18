'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setMessage('Checking credentials...');
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push('/admin/dashboard');
  }

  return (
    <main className="login-wrap">
      <form className="admin-card login-panel" onSubmit={login}>
        <div className="brand"><span className="brand-mark">B</span><span>Bestedesign Admin</span></div>
        <p className="notice">Use the Supabase Auth user you created for the portfolio admin.</p>
        <div className="field"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div>
        <div className="field" style={{ marginTop: 12 }}><label>Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></div>
        {message ? <p className="notice">{message}</p> : null}
        <button className="btn primary" style={{ marginTop: 16 }} type="submit">Login</button>
      </form>
    </main>
  );
}
