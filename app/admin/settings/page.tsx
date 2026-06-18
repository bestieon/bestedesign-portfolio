'use client';

import AdminShell from '@/components/AdminShell';
import { getSupabaseBrowser, getPublicStorageUrl } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const keys = ['hero_title','hero_subtitle','about_text','cv_url','instagram_url','linkedin_url','hero_image_path'];

export default function SettingsPage() {
  const supabase = getSupabaseBrowser();
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('settings').select('key,value');
    const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string | null }) => [r.key, r.value ?? '']));
    setSettings(map);
  }

  async function save() {
    const rows = keys.map((key) => ({ key, value: settings[key] ?? '' }));
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    setMessage(error ? error.message : 'Settings saved.');
  }

  async function uploadHero(file: File) {
    const path = `site/hero-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setMessage(error.message); return; }
    setSettings({ ...settings, hero_image_path: path });
  }

  const hero = getPublicStorageUrl(settings.hero_image_path) ?? '/hero-fallback.svg';

  return (
    <AdminShell>
      <div className="section-head"><h2>Settings</h2></div>
      <div className="admin-card">
        <div className="field"><label>Hero Title</label><input value={settings.hero_title ?? ''} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Hero Subtitle</label><textarea value={settings.hero_subtitle ?? ''} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>About Text</label><textarea value={settings.about_text ?? ''} onChange={(e) => setSettings({ ...settings, about_text: e.target.value })} /></div>
        <div className="form-grid" style={{ marginTop: 14 }}>
          <div className="field"><label>CV URL</label><input value={settings.cv_url ?? ''} onChange={(e) => setSettings({ ...settings, cv_url: e.target.value })} /></div>
          <div className="field"><label>Instagram URL</label><input value={settings.instagram_url ?? ''} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} /></div>
          <div className="field"><label>LinkedIn URL</label><input value={settings.linkedin_url ?? ''} onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })} /></div>
        </div>
        <div className="field" style={{ marginTop: 14 }}><label>Hero Image</label><img src={hero} alt="" style={{ width: 240, borderRadius: 18 }} /><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])} /></div>
        {message ? <p className="notice">{message}</p> : null}
        <button className="btn primary" onClick={save}>Save Settings</button>
      </div>
    </AdminShell>
  );
}
