export function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
