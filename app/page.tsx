import Nav from '@/components/Nav';
import { getProjects, getSettings } from '@/lib/data';
import { getPublicStorageUrl } from '@/lib/supabase';

export default async function Home() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const heroImage = getPublicStorageUrl(settings.hero_image_path) ?? '/hero-fallback.svg';

  return (
    <>
      <Nav />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="kicker">Industrial Design · Portfolio System</div>
            <h1>{settings.hero_title || 'Objects designed with precision.'}</h1>
            <p className="lead">{settings.hero_subtitle || 'A modern product design portfolio built as a 1920 × 1080 visual canvas, ready for curated projects, external pages, and controlled image layouts.'}</p>
            <div className="actions">
              <a className="btn primary" href="#projects">Explore Projects</a>
              {settings.cv_url ? <a className="btn" href={settings.cv_url}>CV / Resume</a> : null}
            </div>
          </div>
          <div className="hero-frame">
            <img src={heroImage} alt="Portfolio hero" />
            <div className="tech-label">1920 × 1080 editorial composition</div>
          </div>
        </section>

        <section id="projects" className="section container">
          <div className="section-head">
            <h2>Selected Projects</h2>
            <p className="meta">Editable from admin panel · Supabase powered</p>
          </div>
          <div className="project-grid">
            {projects.map((project) => {
              const cover = getPublicStorageUrl(project.cover_image_path) ?? '/project-fallback.svg';
              return (
                <a className="project-card" href={`/project/${project.slug}`} key={project.id}>
                  <img src={cover} alt={project.title} />
                  <div className="project-body">
                    <div className="meta"><span>{project.category || 'Product'}</span> · <span>{project.year || ''}</span></div>
                    <h3>{project.title}</h3>
                    <p>{project.short_description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section id="about" className="section container">
          <div className="section-head"><h2>About</h2></div>
          <p className="about-panel">{settings.about_text || 'Edit this biography from the admin settings page. The system is built for product images, conceptual boards, industrial design process visuals, and externally uploaded full-page portfolio layouts.'}</p>
        </section>
      </main>
      <footer className="container section">© {new Date().getFullYear()} Bestedesign. Portfolio system.</footer>
    </>
  );
}
