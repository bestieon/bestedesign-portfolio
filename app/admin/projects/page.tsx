'use client';

import AdminShell from '@/components/AdminShell';
import { getSupabaseBrowser, getPublicStorageUrl } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const supabase = getSupabaseBrowser();

  async function load() {
    const { data } = await supabase.from('projects').select('*').order('sort_order').order('created_at', { ascending: false });
    setProjects((data ?? []) as Project[]);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  }

  return (
    <AdminShell>
      <div className="section-head"><h2>Projects</h2><a className="btn primary" href="/admin/projects/new">New Project</a></div>
      <table className="table"><thead><tr><th>Cover</th><th>Title</th><th>Status</th><th></th></tr></thead><tbody>
        {projects.map((project) => {
          const cover = getPublicStorageUrl(project.cover_image_path) ?? '/project-fallback.svg';
          return <tr key={project.id}><td><img className="thumb" src={cover} alt="" /></td><td>{project.title}<br/><span className="meta">{project.category} · {project.year}</span></td><td>{project.is_published ? 'Published' : 'Hidden'}</td><td><a className="btn" href={`/admin/projects/${project.id}`}>Edit</a> <button className="btn" onClick={() => remove(project.id)}>Delete</button></td></tr>;
        })}
      </tbody></table>
    </AdminShell>
  );
}
