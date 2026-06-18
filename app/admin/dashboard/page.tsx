'use client';

import AdminShell from '@/components/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [counts, setCounts] = useState({ projects: 0, pages: 0 });

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.from('projects').select('id', { count: 'exact', head: true }).then(({ count }) => setCounts((c) => ({ ...c, projects: count ?? 0 })));
    supabase.from('external_pages').select('id', { count: 'exact', head: true }).then(({ count }) => setCounts((c) => ({ ...c, pages: count ?? 0 })));
  }, []);

  return (
    <AdminShell>
      <div className="section-head"><h2>Dashboard</h2></div>
      <a className="btn primary" href="/admin/external">Upload Page Externally</a>
      <div className="form-grid" style={{ marginTop: 18 }}>
        <div className="admin-card"><div className="kicker">Projects</div><h1 style={{ fontSize: 72 }}>{counts.projects}</h1></div>
        <div className="admin-card"><div className="kicker">External Pages</div><h1 style={{ fontSize: 72 }}>{counts.pages}</h1></div>
      </div>
    </AdminShell>
  );
}
