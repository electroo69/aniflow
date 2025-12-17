import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  width: number;
  height: number;
  dataKey: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className, width, height, dataKey }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = bannerRef.current;
    if (!container) return;

    // Use Intersection Observer to load ad only when it's about to be visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load the ad only when it's near the viewport
            loadAd();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the element is visible
      }
    );

    observer.observe(container);

    function loadAd() {
      if (!container) return;

      // Clean up previous iframe to handle React Strict Mode double-mounting
      container.innerHTML = '';

      const iframe = document.createElement('iframe');

      // Set attributes for robustness
      iframe.width = `${width}`;
      iframe.height = `${height}`;
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      iframe.title = "Advertisement";
      iframe.loading = 'lazy'; // Native lazy loading

      // Sandbox permissions are critical for ads to run while keeping the main site safe
      iframe.sandbox.add('allow-scripts', 'allow-popups', 'allow-same-origin', 'allow-forms');

      container.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <base target="_blank">
              <style>
                body { 
                  margin: 0; 
                  padding: 0; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  background: transparent; 
                  overflow: hidden;
                }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : '${dataKey}',
                  'format' : 'iframe',
                  'height' : ${height},
                  'width' : ${width},
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="https://www.highperformanceformat.com/${dataKey}/invoke.js" defer></script>
            </body>
          </html>
        `);
        doc.close();
      }
    }

    return () => observer.disconnect();
  }, [width, height, dataKey]);

  return (
    <div
      ref={bannerRef}
      className={`flex justify-center items-center overflow-hidden bg-slate-900/50 rounded-lg ${className || ''}`}
      style={{ minHeight: height, width: '100%', maxWidth: width }}
    />
  );
};