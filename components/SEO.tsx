import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: object | object[];
  canonicalUrl?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "Discover your next favorite anime and manga on AniFlow. Browse top charts, seasonal releases, and find your next obsession.",
  image = "/og-image.jpg",
  type = 'website',
  jsonLd,
  canonicalUrl
}) => {
  const siteTitle = "AniFlow";
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper for Link tags (canonical)
    const setLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Update Meta Tags
    setMeta('description', description);

    // Open Graph
    setMeta('og:type', type, 'property');
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', canonicalUrl || window.location.href, 'property');
    setMeta('og:site_name', siteTitle, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', fullTitle, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', image, 'name');

    // Canonical
    setLink('canonical', canonicalUrl || window.location.href);

    // JSON-LD Structured Data
    // Remove any existing JSON-LD scripts we've added
    const existingScripts = document.querySelectorAll('script[data-seo-jsonld]');
    existingScripts.forEach(script => script.remove());

    // Add new JSON-LD if provided
    if (jsonLd) {
      const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      jsonLdArray.forEach((data, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', `${index}`);
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }

    // Cleanup function to remove JSON-LD when component unmounts
    return () => {
      const scripts = document.querySelectorAll('script[data-seo-jsonld]');
      scripts.forEach(script => script.remove());
    };

  }, [fullTitle, description, image, type, siteTitle, jsonLd, canonicalUrl]);

  return null;
};