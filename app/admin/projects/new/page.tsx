'use client';

import AdminShell from '@/components/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', category: '', year: '', short_description: '', description: '', sort_order: 0, is_published: true });
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.from('projects').insert({ ...form, slug: toSlug(form.title) }).select('id').single();
    if (error) { setMessage(error.message); return; }
    router.push(`/admin/projects/${data.id}`);
  }

  return (
    <AdminShell>
      <div className="section-head"><h2>New Project</h2></div>
      <form className="admin-card" onSubmit={submit}>
        <div className="form-grid">
          <div className="field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="field"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="field"><label>Year</label><input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
          <div className="field"><label>Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
        </div>
        <div className="field" style={{ marginTop: 14 }}><label>Short Description</label><textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        {message ? <p className="notice">{message}</p> : null}
        <button className="btn primary" type="submit">Create Project</button>
      </form>
    </AdminShell>
  );
}
