import React, { useEffect } from 'react';

export const SITE_URL = 'https://actiondivers2.davebze.workers.dev';
export const SITE_NAME = 'Action Divers & Adventures';
export const DEFAULT_IMAGE = `${SITE_URL}/images/gallery/Boat-out-at-sea.jpg`;

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const absoluteUrl = (value: string) => {
  if (value.startsWith('http')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    if (selector.startsWith('link')) {
      element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
    } else {
      element = document.createElement('meta');
      const propertyMatch = selector.match(/property="([^"]+)"/);
      const nameMatch = selector.match(/name="([^"]+)"/);
      if (propertyMatch) element.setAttribute('property', propertyMatch[1]);
      if (nameMatch) element.setAttribute('name', nameMatch[1]);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  structuredData,
}) => {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonical = absoluteUrl(path);
    const imageUrl = absoluteUrl(image);

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:image"]', 'content', imageUrl);
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', imageUrl);

    document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((node) => node.remove());
    if (structuredData) {
      const items = Array.isArray(structuredData) ? structuredData : [structuredData];
      items.forEach((item) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.seoJsonld = 'true';
        script.text = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }
  }, [title, description, path, image, type, noindex, structuredData]);

  return null;
};

export default SEO;
