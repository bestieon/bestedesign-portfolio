import Nav from '@/components/Nav';
import { getExternalPage } from '@/lib/data';
import { getPublicStorageUrl } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function ExternalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getExternalPage(slug);
  if (!page) notFound();
  const src = getPublicStorageUrl(page.file_path);

  return (
    <>
      <Nav />
      <main className="container section">
        <div className="section-head"><h2>{page.title}</h2><p className="meta">External upload · {page.file_type}</p></div>
        {src && page.file_type.startsWith('image/') ? <img src={src} alt={page.title} style={{ width: '100%', borderRadius: 24, border: '1px solid var(--line)' }} /> : null}
        {src && !page.file_type.startsWith('image/') ? <a className="btn primary" href={src} target="_blank" rel="noreferrer">Open uploaded page</a> : null}
      </main>
    </>
  );
}
