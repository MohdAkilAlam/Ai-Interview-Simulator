import { useEffect } from 'react';

/**
 * Watches for elements with .reveal, .reveal-left, .reveal-scale
 * and adds .visible when they enter the viewport.
 * Uses IntersectionObserver for performance.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-scale';
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe after a short delay so elements are rendered
    const timer = setTimeout(() => {
      document.querySelectorAll(selectors).forEach((el) => observer.observe(el));
    }, 60);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}
