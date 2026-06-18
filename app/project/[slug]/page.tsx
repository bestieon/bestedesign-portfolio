import Nav from '@/components/Nav';
import { getProjectBySlug } from '@/lib/data';
import { getPublicStorageUrl } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { project, images } = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <Nav />
      <main className="container">
        <section className="project-hero">
          <div className="kicker">{project.category || 'Project'} · {project.year || 'Portfolio'}</div>
          <h1>{project.title}</h1>
          <p className="project-copy">{project.description || project.short_description}</p>
        </section>
        <section className="image-stage">
          {images.map((image) => {
            const src = getPublicStorageUrl(image.image_path);
            return (
              <figure className="positioned-image" key={image.id} style={{ left: `${image.x}%`, top: `${image.y}%`, width: `${image.width}%`, height: `${image.height}%` }}>
                {src ? <img src={src} alt={image.caption || project.title} /> : null}
              </figure>
            );
          })}
        </section>
      </main>
    </>
  );
}
