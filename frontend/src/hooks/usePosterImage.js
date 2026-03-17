import { useEffect, useState } from 'react';
import posterFallback from '../assets/poster-fallback.svg';

const usePosterImage = (posterUrl) => {
    const [posterSrc, setPosterSrc] = useState(posterFallback);

    useEffect(() => {
        if (!posterUrl || posterUrl === 'N/A') {
            setPosterSrc(posterFallback);
            return;
        }

        let active = true;
        const image = new Image();

        image.onload = () => {
            if (active) {
                setPosterSrc(posterUrl);
            }
        };

        image.onerror = () => {
            if (active) {
                setPosterSrc(posterFallback);
            }
        };

        image.src = posterUrl;

        return () => {
            active = false;
        };
    }, [posterUrl]);

    return posterSrc;
};

export default usePosterImage;
