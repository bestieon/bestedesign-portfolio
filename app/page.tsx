import Nav from '@/components/Nav';

const covers = {
  light: 'radial-gradient(circle at 52% 42%, #fff 0 7%, #e8e4dc 8% 20%, transparent 21%), radial-gradient(circle at 56% 34%, rgba(255,255,255,.95), transparent 30%), linear-gradient(145deg,#f9f8f5,#d9d6cf 52%,#fff)',
  car: 'radial-gradient(ellipse at 50% 62%, rgba(0,0,0,.16), transparent 30%), linear-gradient(160deg,#f8f8f6,#d7dbe0 48%,#fff)',
  product: 'radial-gradient(circle at 58% 38%, #fff, transparent 28%), linear-gradient(145deg,#faf9f6,#d9ddd9 50%,#fff)'
};

const projects = [
  ['Soft Halo Lighting', 'Lighting Design', 'A quiet lighting object with soft relief shadows.', covers.light],
  ['Aero Surface Concept', 'Automotive Design', 'A clean mobility form study with calm reflections.', covers.car],
  ['Quiet Home Interface', 'Product Design', 'A minimal home product with tactile control details.', covers.product]
];

function Art({ bg, children }: { bg: string; children?: React.ReactNode }) {
  return <div style={{ position: 'absolute', inset: 0, background: bg }}>{children}</div>;
}

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="hero-apple container">
          <div className="hero-top">
            <div><div className="eyebrow">Selected industrial design work</div><h1 className="hero-title">Bestedesign</h1></div>
            <p className="hero-note">A quiet white portfolio surface for product, lighting and automotive design.</p>
          </div>
          <div className="project-showcase">
            <a className="showcase-main" href="#projects">
              <Art bg={covers.light} />
              <div className="project-info-float"><div><span className="project-pill">Lighting Design · 2026</span><h2>Soft Halo Lighting</h2></div><span className="btn primary">EXPLORE PORTFOLIO</span></div>
            </a>
            <div className="showcase-stack">
              {projects.slice(1).map((p) => <a className="showcase-stack-card" href="#projects" key={p[0]}><Art bg={p[3]} /><div className="stack-label"><h3>{p[0]}</h3><p>{p[2]}</p></div></a>)}
            </div>
          </div>
        </section>
        <section id="projects" className="section container">
          <div className="section-head"><h2>Projects</h2><p className="meta">soft hover · clean selection · admin editable</p></div>
          <div className="project-grid">
            {projects.map((p) => <a className="project-card" href="#" key={p[0]}><Art bg={p[3]} /><div className="project-body"><div className="meta">{p[1]} · 2026</div><h3>{p[0]}</h3><p>{p[2]}</p></div></a>)}
          </div>
        </section>
      </main>
    </>
  );
}
