/** Public-folder URL. Unoptimized next/image does not apply basePath. */
export function publicAsset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}
