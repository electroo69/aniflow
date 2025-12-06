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

    // Clean up previous iframe if any
    container.innerHTML = '';

    // Create an iframe to isolate the ad script
    // This is crucial because ad networks often use document.write which breaks React apps
    const iframe = document.createElement('iframe');
    iframe.width = `${width}`;
    iframe.height = `${height}`;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    
    container.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
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
            <script type="text/javascript" src="//www.highperformanceformat.com/${dataKey}/invoke.js"></script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, [width, height, dataKey]);

  return (
    <div 
      ref={bannerRef} 
      className={`flex justify-center items-center overflow-hidden bg-slate-900/50 rounded-lg ${className || ''}`}
      style={{ minHeight: height, width: '100%' }}
    />
  );
};