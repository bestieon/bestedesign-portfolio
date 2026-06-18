export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  year: string | null;
  short_description: string | null;
  description: string | null;
  cover_image_path: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_path: string;
  caption: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  sort_order: number;
  is_visible: boolean;
};

export type SiteSetting = {
  key: string;
  value: string | null;
};

export type ExternalPage = {
  id: string;
  title: string;
  slug: string;
  file_path: string;
  file_type: string;
  is_published: boolean;
  created_at: string;
};
