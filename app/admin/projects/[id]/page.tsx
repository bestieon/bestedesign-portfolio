'use client';

import AdminShell from '@/components/AdminShell';
import { getSupabaseBrowser, getPublicStorageUrl } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import type { Project, ProjectImage } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

type Preset = '16:9' | '1:1' | '3:4' | '4:5' | '9:16';
type LocalPreview = { name: string; url: string; type: string };
const presets: Record<Preset, [number, number]> = { '16:9': [1920, 1080], '1:1': [1080, 1080], '3:4': [1080, 1440], '4:5': [1080, 1350], '9:16': [1080, 1920] };
const cardStyle = { border: '1px solid rgba(20,22,28,.08)', borderRadius: 28, background: 'rgba(255,255,255,.76)', boxShadow: '0 24px 70px rgba(24,28,36,.08)' } as const;

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<ProjectImage[]>([]);
  const [preset, setPreset] = useState<Preset>('16:9');
  const [message, setMessage] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([]);
  const dragCounter = useRef(0);
  const dragOffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = getSupabaseBrowser();

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);
  useEffect(() => { if (id) load(); }, [id]);

  function clearDragTimer() {
    if (dragOffTimer.current) clearTimeout(dragOffTimer.current);
    dragOffTimer.current = null;
  }

  function activateDrop() {
    clearDragTimer();
    setDropActive(true);
  }

  function handleDropEnter(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounter.current += 1;
    activateDrop();
  }

  function handleDropOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    activateDrop();
  }

  function handleDropLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      clearDragTimer();
      dragOffTimer.current = setTimeout(() => setDropActive(false), 120);
    }
  }

  function handleDropFiles(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounter.current = 0;
    clearDragTimer();
    setDropActive(false);
    uploadPages(e.dataTransfer.files);
  }

  async function load() {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single();
    const { data: pageData } = await supabase.from('project_images').select('*').eq('project_id', id).order('sort_order', { ascending: true });
    setProject(data as Project);
    setPages((pageData ?? []) as ProjectImage[]);
  }

  async function save() {
    if (!project) return;
    const { error } = await supabase.from('projects').update({ title: project.title, slug: project.slug || toSlug(project.title), category: project.category, year: project.year, short_description: project.short_description, description: project.description, sort_order: project.sort_order, is_published: project.is_published, cover_image_path: project.cover_image_path }).eq('id', project.id);
    setMessage(error ? error.message : 'Project saved.');
  }

  async function uploadCover(file: File) {
    if (!project) return;
    const path = `projects/${project.id}/cover-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setMessage(error.message); return; }
    setProject({ ...project, cover_image_path: path });
  }

  async function uploadPages(files: FileList | File[]) {
    if (!project) return;
    const list = Array.from(files);
    if (!list.length) return;
    const [w, h] = presets[preset];
    setLocalPreviews(list.map((file) => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) })));
    setUploading(true);
    setMessage(`Bulk upload started: ${list.length} file.`);
    for (let i = 0; i < list.length; i++) {
      setUploadProgress(`${i + 1} / ${list.length} uploading`);
      const file = list[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `projects/${project.id}/pages/${Date.now()}-${i}-${safeName}`;
      const { error } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true, contentType: file.type });
      if (error) { setMessage(error.message); continue; }
      await supabase.from('project_images').insert({ project_id: project.id, image_path: path, caption: `${preset} · ${w}x${h}`, sort_order: pages.length + i, is_visible: true });
    }
    setUploading(false);
    setUploadProgress('');
    setMessage(`${list.length} page added to ${project.title}.`);
    setLocalPreviews([]);
    load();
  }

  async function movePage(fromId: string, toId: string) {
    if (fromId === toId) return;
    const current = [...pages];
    const from = current.findIndex((p) => p.id === fromId);
    const to = current.findIndex((p) => p.id === toId);
    const [item] = current.splice(from, 1);
    current.splice(to, 0, item);
    setPages(current);
    await Promise.all(current.map((p, index) => supabase.from('project_images').update({ sort_order: index }).eq('id', p.id)));
  }

  async function removePage(page: ProjectImage) {
    await supabase.from('project_images').delete().eq('id', page.id);
    setPages(pages.filter((p) => p.id !== page.id));
  }

  function pageCard(page: ProjectImage, index: number) {
    const src = getPublicStorageUrl(page.image_path) || '';
    const video = /\.(mp4|webm|mov)$/i.test(page.image_path);
    return <div className={`page-admin-card ${dragId === page.id ? 'dragging' : ''}`} key={page.id} draggable onDragStart={() => setDragId(page.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => dragId && movePage(dragId, page.id)}>
      <div style={{ aspectRatio: '16 / 9', borderRadius: 18, background: '#f7f7f5', display: 'grid', placeItems: 'center', overflow: 'hidden', border: '1px solid rgba(20,22,28,.08)' }}>
        {video ? <video src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
      </div>
      <div className="mini-actions"><span className="meta">Page {index + 1}</span><button className="btn" onClick={() => removePage(page)}>Delete</button></div>
    </div>;
  }

  if (!project) return <AdminShell><p className="notice">Loading project...</p></AdminShell>;
  const cover = getPublicStorageUrl(project.cover_image_path) ?? '/project-fallback.svg';
  const [w, h] = presets[preset];

  return (
    <AdminShell>
      <div className="section-head"><div><p className="meta">Selected project</p><h2>{project.title}</h2></div><a className="btn" href={`/project/${project.slug}`}>View Public</a></div>

      <div className="admin-card" style={cardStyle}>
        <div className="section-head"><div><p className="meta">Project pages</p><h2>Bulk upload & order</h2></div><span className="btn primary">{pages.length} pages</span></div>
        <div className="resolution-row">
          <div className="field"><label>Resolution preset</label><select value={preset} onChange={(e) => setPreset(e.target.value as Preset)}>{Object.keys(presets).map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="field"><label>Width</label><input value={w} readOnly /></div>
          <div className="field"><label>Height</label><input value={h} readOnly /></div>
        </div>
        <label className="drop-zone" style={{ position: 'relative', display: 'block', marginTop: 18, padding: 42, cursor: 'pointer', transform: dropActive ? 'scale(1.01)' : 'none', borderColor: dropActive ? '#111' : undefined, background: dropActive ? 'rgba(255,255,255,.96)' : undefined }} onDragEnter={handleDropEnter} onDragOver={handleDropOver} onDragLeave={handleDropLeave} onDrop={handleDropFiles} onDragEnd={() => { dragCounter.current = 0; clearDragTimer(); setDropActive(false); }}>
          {dropActive && <div style={{ pointerEvents: 'none', position: 'absolute', inset: 12, borderRadius: 24, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.88)', border: '1px solid rgba(0,0,0,.12)', boxShadow: '0 30px 80px rgba(24,28,36,.14)', zIndex: 2 }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 42, marginBottom: 8 }}>↓</div><strong>Drop files here</strong><p className="notice">Images and videos will be added to this selected project.</p></div></div>}
          <span className="btn primary">Bulk upload pages to this project</span>
          <p className="notice" style={{ margin: '16px 0 0' }}>Click here or drag all 1920x1080 pages at once. The system uploads them as ordered project pages and shows realistic previews below.</p>
          <input type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={(e) => e.target.files && uploadPages(e.target.files)} />
        </label>
        {(uploading || localPreviews.length > 0) && <div className="admin-card" style={{ marginTop: 18, background: '#fff' }}><div className="section-head"><h2>Uploading preview</h2><span className="meta">{uploadProgress}</span></div><div className="page-manager-grid">{localPreviews.map((file) => <div className="page-admin-card" key={file.url}><div style={{ aspectRatio: '16 / 9', borderRadius: 18, overflow: 'hidden', background: '#f7f7f5', display: 'grid', placeItems: 'center' }}>{file.type.startsWith('video') ? <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <img src={file.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}</div><p className="notice" style={{ margin: '10px 0 0' }}>{file.name}</p></div>)}</div></div>}
        <div className="page-manager-grid" style={{ marginTop: 22 }}>
          {pages.map((page, index) => pageCard(page, index))}
        </div>
      </div>

      <div className="admin-card" style={cardStyle}>
        <div className="section-head"><h2>Project details</h2><button className="btn primary" onClick={save}>Save Project</button></div>
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
        <div className="field" style={{ marginTop: 14 }}><label>1920x1080 Cover Image</label><img className="thumb" src={cover} alt="" /><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} /></div>
        {message ? <p className="notice">{message}</p> : null}
      </div>
    </AdminShell>
  );
}
