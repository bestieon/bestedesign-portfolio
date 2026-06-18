import Nav from '@/components/Nav';
import { getProjectBySlug } from '@/lib/data';
import { getPublicStorageUrl } from '@/lib/supabase';
import { notFound } from 'next/navigation';

const fallback: Record<string, any> = {
  'soft-halo-lighting': { title: 'Soft Halo Lighting', category: 'Lighting Design', year: '2026', description: 'A calm lighting object shaped by soft glow, relief shadows and a precise white presentation surface.', image: 'radial-gradient(circle at 52% 42%, #fff 0 7%, #e8e4dc 8% 20%, transparent 21%), radial-gradient(circle at 56% 34%, rgba(255,255,255,.95), transparent 30%), linear-gradient(145deg,#f9f8f5,#d9d6cf 52%,#fff)' },
  'aero-surface-concept': { title: 'Aero Surface Concept', category: 'Automotive Design', year: '2026', description: 'A premium mobility surface study focused on proportion, reflection control and quiet sculptural tension.', image: 'radial-gradient(ellipse at 50% 62%, rgba(0,0,0,.16), transparent 30%), linear-gradient(160deg,#f8f8f6,#d7dbe0 48%,#fff)' },
  'quiet-home-interface': { title: 'Quiet Home Interface', category: 'Product Design', year: '2026', description: 'A minimal home object exploring tactile controls, soft material transitions and elegant usability.', image: 'radial-gradient(circle at 58% 38%, #fff, transparent 28%), linear-gradient(145deg,#faf9f6,#d9ddd9 50%,#fff)' }
};

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { project, images } = await getProjectBySlug(slug);
  const fb = fallback[slug];
  if (!project && !fb) notFound();
  const title = project?.title || fb.title;
  const category = project?.category || fb.category;
  const year = project?.year || fb.year;
  const description = project?.description || fb.description;

  return (
    <>
      <Nav />
      <main className="container">
        <section className="project-hero">
          <div className="eyebrow">{category} · {year}</div>
          <h1>{title}</h1>
          <p className="project-copy">{description}</p>
        </section>
        <section className="page-gallery">
          {images.length ? images.map((image) => {
            const src = getPublicStorageUrl(image.image_path) || '';
            const isVideo = /\.(mp4|webm|mov)$/i.test(image.image_path);
            return <article className="portfolio-page" key={image.id}><div className="page-frame" style={{ aspectRatio: '16 / 9' }}>{isVideo ? <video src={src} controls /> : <img src={src} alt={image.caption || title} />}</div>{image.caption && <div className="page-caption">{image.caption}</div>}</article>;
          }) : <article className="portfolio-page"><div className="page-frame" style={{ aspectRatio: '16 / 9', background: fb.image }} /></article>}
        </section>
      </main>
    </>
  );
}
