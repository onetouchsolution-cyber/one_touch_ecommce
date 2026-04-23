import React, { useState } from 'react';

const SafeImage = ({ src, alt, className, ...props }) => {
    const [error, setError] = useState(false);

    // Default fallback SVG or plain solid color if no image
    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Cpath d='M35 65L45 50L55 60L70 40L85 65H35Z' fill='%23cbd5e1'/%3E%3Ccircle cx='45' cy='35' r='5' fill='%23cbd5e1'/%3E%3C/svg%3E";

    const getProcessedSrc = (url) => {
        if (!url) return fallbackImage;
        
        try {
            // Check if it's a Google Drive URL
            if (url.includes('drive.google.com')) {
                // Extract the file ID from formats like:
                // https://drive.google.com/file/d/1a2b3c4d5e/view
                // https://drive.google.com/open?id=1a2b3c4d5e
                let fileId = null;
                const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    fileId = match[1];
                } else {
                    const urlObj = new URL(url);
                    fileId = urlObj.searchParams.get('id');
                }

                if (fileId) {
                    // Convert to reliable thumbnail direct link
                    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                }
            }
        } catch (e) {
            console.error("Error processing image URL:", url, e);
        }

        return url;
    };

    if (error || !src) {
        return <img src={fallbackImage} alt={alt || "Not available"} className={`${className} object-cover`} {...props} />;
    }

    return (
        <img
            src={getProcessedSrc(src)}
            alt={alt || "Image"}
            className={className}
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
            {...props}
        />
    );
};

export default SafeImage;
