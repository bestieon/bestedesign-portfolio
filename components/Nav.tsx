export default function Nav() {
  return (
    <nav className="nav container">
      <a className="brand" href="/">
        <span className="brand-mark">B</span>
        <span>Bestedesign</span>
      </a>
      <div className="nav-links">
        <a href="/#projects">Projects</a>
        <a href="/#about">About</a>
        <a href="/admin/login">Admin</a>
      </div>
    </nav>
  );
}
