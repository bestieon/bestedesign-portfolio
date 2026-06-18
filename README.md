# Bestedesign Portfolio — Next.js + Supabase + Vercel

This is a modern portfolio system for **bestedesign.com**. It replaces the cPanel/PHP path with a cleaner stack:

- **GitHub**: source code repository
- **Vercel**: hosting and deployment
- **Supabase**: database, auth, and media storage

## Core features

- 1920×1080-inspired industrial design portfolio frontend
- Admin login with Supabase Auth
- Editable homepage settings: hero title, subtitle, about text, CV/social links, hero image
- Project CRUD
- Project cover image upload
- Project image layout editor with X/Y/width/height/order/visibility/caption controls
- Prominent **Upload Page Externally** admin flow
- External uploads for image, PDF, and HTML pages
- Public project pages and external page viewer

## 1. Supabase setup

The Supabase schema has already been applied to project `kbrvvuauvqfsfyjxtihr`.

It creates:

- `admin_users`
- `settings`
- `projects`
- `project_images`
- `external_pages`
- `portfolio` storage bucket
- RLS policies

## 2. Create the admin user

In Supabase:

1. Go to **Authentication → Users**.
2. Create a user for the real admin email.
3. Go to **SQL Editor** and run this, replacing the email:

```sql
insert into public.admin_users(email)
values ('admin@example.com')
on conflict (email) do nothing;
```

Only emails in `admin_users` can access admin writes.

## 3. Environment variables

In Vercel, set these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kbrvvuauvqfsfyjxtihr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
NEXT_PUBLIC_SITE_URL=https://bestedesign.com
```

You can find these in Supabase under **Project Settings → API**.

## 4. Local development

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
http://localhost:3000/admin/login
```

## 5. GitHub + Vercel deployment

1. Push this folder to a GitHub repository, for example `bestedesign-portfolio`.
2. In Vercel, create a new project from that GitHub repository.
3. Add the environment variables above.
4. Deploy.
5. Test the temporary Vercel domain first.
6. Add `bestedesign.com` and `www.bestedesign.com` in Vercel Project Settings → Domains.
7. Change DNS only after the Vercel preview is working.

## 6. Domain notes

The domain does not need cPanel hosting. The domain DNS records should point to Vercel. Keep existing MX records intact if email is used.

## 7. Admin URLs

```txt
/admin/login
/admin/dashboard
/admin/projects
/admin/settings
/admin/external
```

## 8. Security notes

- Do not commit `.env.local`.
- Do not share Supabase service role keys publicly.
- Do not expose database passwords.
- Keep `admin_users` limited to trusted emails.
