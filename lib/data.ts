import { getSupabasePublic } from './supabase';
import type { ExternalPage, Project, ProjectImage } from './types';

export async function getSettings() {
  const supabase = getSupabasePublic();
  const { data } = await supabase.from('settings').select('key,value');
  return Object.fromEntries((data ?? []).map((row: { key: string; value: string | null }) => [row.key, row.value ?? '']));
}

export async function getProjects() {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProjectBySlug(slug: string) {
  const supabase = getSupabasePublic();
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  if (error || !project) return { project: null, images: [] as ProjectImage[] };
  const { data: images } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', project.id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  return { project: project as Project, images: (images ?? []) as ProjectImage[] };
}

export async function getExternalPage(slug: string) {
  const supabase = getSupabasePublic();
  const { data } = await supabase
    .from('external_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data as ExternalPage | null;
}
