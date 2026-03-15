import type { ImgHTMLAttributes } from 'react'

const JIKAN_CDN_PATTERN = /^https:\/\/cdn\.myanimelist\.net\//

export function isJikanImage(src: string | undefined): boolean {
  return !!src && JIKAN_CDN_PATTERN.test(src)
}

export function AnimeCard({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null

  return (
    <figure className="my-3 inline-block overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <img
        src={src}
        alt={alt || 'Anime cover'}
        loading="lazy"
        className="h-auto w-[120px] object-cover"
        {...rest}
      />
      {alt ? (
        <figcaption className="px-2 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">{alt}</figcaption>
      ) : null}
    </figure>
  )
}
