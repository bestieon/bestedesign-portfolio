'use client';

import AdminShell from '@/components/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import { useEffect, useState } from 'react';
import type { ExternalPage } from '@/lib/types';

const allowed = ['image/png','image/jpeg','image/webp','image/gif','application/pdf','text/html'];

export default function ExternalUploadPage() {
  const supabase = getSupabaseBrowser();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ExternalPage[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from('external_pages').select('*').order('created_at', { ascending: false });
    setPages((data ?? []) as ExternalPage[]);
  }

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !title) return;
    if (!allowed.includes(file.type)) { setMessage('Unsupported file type. Use image, PDF, or HTML.'); return; }
    const slug = toSlug(title);
    const path = `external/${slug}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setMessage(uploadError.message); return; }
    const { error } = await supabase.from('external_pages').insert({ title, slug, file_path: path, file_type: file.type, is_published: true });
    setMessage(error ? error.message : 'External page uploaded.');
    setTitle(''); setFile(null); load();
  }

  return (
    <AdminShell>
      <div className="section-head"><h2>Upload Page Externally</h2></div>
      <form className="admin-card" onSubmit={upload}>
        <p className="notice">Use this when the page is already prepared externally. Supported: image, PDF, HTML.</p>
        <div className="field"><label>Page Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Prepared Page File</label><input type="file" accept="image/*,.pdf,.html,text/html" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required /></div>
        {message ? <p className="notice">{message}</p> : null}
        <button className="btn primary" type="submit">Upload Page Externally</button>
      </form>
      <div className="admin-card">
        <h3>External Pages</h3>
        <table className="table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th></th></tr></thead><tbody>
          {pages.map((p) => <tr key={p.id}><td>{p.title}<br/><span className="meta">/{p.slug}</span></td><td>{p.file_type}</td><td>{p.is_published ? 'Published' : 'Hidden'}</td><td><a className="btn" href={`/external/${p.slug}`}>View</a></td></tr>)}
        </tbody></table>
      </div>
    </AdminShell>
  );
}
