
import { useEffect } from 'react';


const MetaPixel = () => {
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

    useEffect(() => {
        if (!PIXEL_ID) {
            console.warn('⚠️ Meta Pixel ID not found');
            return;
        }

        // ✅ Only initialize if not already initialized
        if (window.fbq) {
            console.log('⚠️ Meta Pixel already initialized');
            return;
        }

        // Initialize Meta Pixel
        (function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = true;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = true;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', PIXEL_ID);
        window.fbq('track', 'PageView');

        console.log('✅ Meta Pixel initialized successfully');

    }, []); // Empty dependency array - run only once

    return null; // No render needed
};



export default MetaPixel;
