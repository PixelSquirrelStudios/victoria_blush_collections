'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { FaChevronCircleUp } from 'react-icons/fa';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        // If at the top, hide the button immediately
        setIsVisible(false);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      } else {
        setIsVisible(true);

        // Clear the existing timer if the user keeps scrolling
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Set a timer to hide the button after 3 seconds of inactivity
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Remove any # fragment from the URL
    const urlWithoutHash = window.location.href.split('#')[0];
    window.history.replaceState(null, '', urlWithoutHash);
  };

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-12 right-8 z-50 h-14 w-14 rounded-full p-0 shadow-lg transition-opacity duration-500 ${isVisible ? 'opacity-70 hover:opacity-100' : 'pointer-events-none opacity-0'
        }`}
    >
      <FaChevronCircleUp className="h-14! w-14!" />
    </Button>
  );
};

export default ScrollToTopButton;
