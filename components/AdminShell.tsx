import Link from 'next/link';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="brand" href="/admin/dashboard"><span className="brand-mark">B</span><span>Admin</span></Link>
        <div className="admin-menu">
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/settings">Settings</Link>
          <Link href="/">View Site</Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
