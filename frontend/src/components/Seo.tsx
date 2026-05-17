import { useEffect } from 'react'

export type SeoProps = {
  title: string
  description: string
  keywords?: string
  canonicalPath?: string
}

/**
 * Sets document title and meta tags for lightweight SEO (no extra npm deps).
 * For production indexing, ensure the host also serves these in initial HTML or prerender.
 */
export function Seo({ title, description, keywords, canonicalPath }: SeoProps) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    upsertMeta('name', 'description', description)
    if (keywords) upsertMeta('name', 'keywords', keywords)

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (canonicalPath) {
      const href = `${window.location.origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = href
    }

    return () => {
      document.title = prevTitle
    }
  }, [title, description, keywords, canonicalPath])

  return null
}
