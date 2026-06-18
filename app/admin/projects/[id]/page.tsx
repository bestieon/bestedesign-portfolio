'use client';

import AdminShell from '@/components/AdminShell';
import { getSupabaseBrowser, getPublicStorageUrl } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import type { Project } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [message, setMessage] = useState('');
  const supabase = getSupabaseBrowser();

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);
  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single();
    setProject(data as Project);
  }

  async function save() {
    if (!project) return;
    const { error } = await supabase.from('projects').update({
      title: project.title,
      slug: project.slug || toSlug(project.title),
      category: project.category,
      year: project.year,
      short_description: project.short_description,
      description: project.description,
      sort_order: project.sort_order,
      is_published: project.is_published,
      cover_image_path: project.cover_image_path
    }).eq('id', project.id);
    setMessage(error ? error.message : 'Project saved.');
  }

  async function uploadCover(file: File) {
    if (!project) return;
    const path = `projects/${project.id}/cover-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setMessage(error.message); return; }
    setProject({ ...project, cover_image_path: path });
  }

  if (!project) return <AdminShell><p className="notice">Loading project...</p></AdminShell>;
  const cover = getPublicStorageUrl(project.cover_image_path) ?? '/project-fallback.svg';

  return (
    <AdminShell>
      <div className="section-head"><h2>Edit Project</h2><a className="btn" href={`/project/${project.slug}`}>View Public</a></div>
      <div className="admin-card">
        <div className="form-grid">
          <div className="field"><label>Title</label><input value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value, slug: toSlug(e.target.value) })} /></div>
          <div className="field"><label>Slug</label><input value={project.slug} onChange={(e) => setProject({ ...project, slug: e.target.value })} /></div>
          <div className="field"><label>Category</label><input value={project.category ?? ''} onChange={(e) => setProject({ ...project, category: e.target.value })} /></div>
          <div className="field"><label>Year</label><input value={project.year ?? ''} onChange={(e) => setProject({ ...project, year: e.target.value })} /></div>
          <div className="field"><label>Sort Order</label><input type="number" value={project.sort_order} onChange={(e) => setProject({ ...project, sort_order: Number(e.target.value) })} /></div>
          <div className="field"><label>Published</label><select value={project.is_published ? '1' : '0'} onChange={(e) => setProject({ ...project, is_published: e.target.value === '1' })}><option value="1">Published</option><option value="0">Hidden</option></select></div>
        </div>
        <div className="field" style={{ marginTop: 14 }}><label>Short Description</label><textarea value={project.short_description ?? ''} onChange={(e) => setProject({ ...project, short_description: e.target.value })} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Description</label><textarea value={project.description ?? ''} onChange={(e) => setProject({ ...project, description: e.target.value })} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Cover Image</label><img className="thumb" src={cover} alt="" /><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} /></div>
        {message ? <p className="notice">{message}</p> : null}
        <button className="btn primary" onClick={save}>Save Project</button>
      </div>
    </AdminShell>
  );
}
