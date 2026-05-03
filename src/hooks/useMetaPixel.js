import { useCallback, useRef } from 'react';

const useMetaPixel = () => {
    // Track which events have been fired to prevent duplicates
    const firedEvents = useRef(new Set());

    // Check if fbq is available
    const isFbqAvailable = useCallback(() => {
        return typeof window !== 'undefined' && typeof window.fbq === 'function';
    }, []);

    // Helper to prevent duplicate events
    const trackOnce = useCallback((eventKey, trackFn) => {
        if (firedEvents.current.has(eventKey)) {
            console.log(`⚠️ Event ${eventKey} already fired, skipping...`);
            return;
        }
        firedEvents.current.add(eventKey);
        trackFn();
    }, []);

    // Track view content
    const trackViewContent = useCallback((params = {}) => {
        if (isFbqAvailable()) {
            const eventKey = `ViewContent_${params.content_ids?.[0] || 'unknown'}`;
            trackOnce(eventKey, () => {
                window.fbq('track', 'ViewContent', {
                    content_type: 'product',
                    content_ids: params.content_ids || [],
                    content_name: params.content_name || '',
                    content_category: params.content_category || '',
                    value: params.value || 0,
                    currency: params.currency || 'INR'
                });
                console.log('📊 ViewContent tracked');
            });
        }
    }, [isFbqAvailable, trackOnce]);

    // Track add to cart
    const trackAddToCart = useCallback((params = {}) => {
        if (isFbqAvailable()) {
            window.fbq('track', 'AddToCart', {
                content_type: 'product',
                content_ids: params.content_ids || [],
                content_name: params.content_name || '',
                content_category: params.content_category || '',
                value: params.value || 0,
                currency: params.currency || 'INR'
            });
            console.log('📊 AddToCart tracked');
        }
    }, [isFbqAvailable]);

    // Track initiate checkout (only once per session)
    const trackInitiateCheckout = useCallback((params = {}) => {
        if (isFbqAvailable()) {
            trackOnce('InitiateCheckout', () => {
                window.fbq('track', 'InitiateCheckout', {
                    content_type: 'product',
                    content_ids: params.content_ids || [],
                    num_items: params.num_items || 1,
                    value: params.value || 0,
                    currency: params.currency || 'INR'
                });
                console.log('📊 InitiateCheckout tracked');
            });
        }
    }, [isFbqAvailable, trackOnce]);

    // Track add payment info (only once per session)
    const trackAddPaymentInfo = useCallback((params = {}) => {
        if (isFbqAvailable()) {
            trackOnce('AddPaymentInfo', () => {
                window.fbq('track', 'AddPaymentInfo', {
                    content_type: 'product',
                    content_ids: params.content_ids || [],
                    value: params.value || 0,
                    currency: params.currency || 'INR'
                });
                console.log('📊 AddPaymentInfo tracked');
            });
        }
    }, [isFbqAvailable, trackOnce]);

    // Track purchase (only once per transaction)
    const trackPurchase = useCallback((params = {}) => {
        if (isFbqAvailable()) {
            const eventKey = `Purchase_${params.value || Date.now()}`;
            trackOnce(eventKey, () => {
                window.fbq('track', 'Purchase', {
                    content_type: 'product',
                    content_ids: params.content_ids || [],
                    value: params.value || 0,
                    currency: params.currency || 'INR',
                    num_items: params.num_items || 1
                });
                console.log('📊 Purchase tracked');
            });
        }
    }, [isFbqAvailable, trackOnce]);

    // Track custom event
    const trackCustomEvent = useCallback((eventName, params = {}) => {
        if (isFbqAvailable()) {
            window.fbq('trackCustom', eventName, params);
            console.log('📊 Custom event tracked:', eventName);
        }
    }, [isFbqAvailable]);

    return {
        trackViewContent,
        trackAddToCart,
        trackInitiateCheckout,
        trackAddPaymentInfo,
        trackPurchase,
        trackCustomEvent
    };
};

export default useMetaPixel;
