'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { NOTIFICATION_AUDIO_URL } from '@/constants';
import { createClient } from '@/lib/supabase/client';

interface AudioContextType {
  audioEnabled: boolean;
  toggleAudio: () => Promise<void>;
  setAudioState: (value: boolean) => Promise<void>;
  playNotificationSound: () => void;
  testNotificationSound: () => void; // Added for debugging
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({
  children,
  userId,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const notificationBell = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);

    const stored = localStorage.getItem('audioEnabled') === 'true';
    setAudioEnabled(stored);

    // Create audio elements with better loading handling
    const setupAudio = () => {
      notificationBell.current = new Audio(NOTIFICATION_AUDIO_URL);

      if (notificationBell.current) {
        notificationBell.current.preload = 'auto';
        notificationBell.current.volume = 0.5; // Set reasonable volume
        notificationBell.current.muted = !stored;

        notificationBell.current.addEventListener('canplaythrough', () => {
          console.log('Notification audio loaded successfully');
          setAudioLoaded(true);
        });

        notificationBell.current.addEventListener('error', (e) => {
          console.error('Notification audio load error:', e);
        });
      }
    };

    setupAudio();
  }, []);

  useEffect(() => {
    if (notificationBell.current) {
      notificationBell.current.muted = !audioEnabled;
      console.log('Audio muted state updated:', !audioEnabled);
    }
  }, [audioEnabled]);

  const playNotificationSound = () => {
    console.log('playNotificationSound called', {
      audioEnabled,
      audioLoaded,
      hasAudioElement: !!notificationBell.current,
    });

    if (!audioEnabled) {
      console.log('Audio is disabled');
      return;
    }

    if (!notificationBell.current) {
      console.log('Audio element not ready');
      return;
    }

    try {
      notificationBell.current.currentTime = 0;
      const playPromise = notificationBell.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Notification sound played successfully');
          })
          .catch((error) => {
            console.error('Notification sound play failed:', error);
            // Try to handle autoplay policy
            if (error.name === 'NotAllowedError') {
              console.log(
                'Autoplay blocked - user interaction required first'
              );
            }
          });
      }
    } catch (error) {
      console.error('Notification sound error:', error);
    }
  };

  // Test function for debugging
  const testNotificationSound = () => {
    console.log('Testing notification sound manually');
    playNotificationSound();
  };

  // const updateDatabase = async (value: boolean) => {
  //   if (!userId) return;
  //   try {
  //     const supabase = createClient();
  //     const { error } = await supabase
  //       .from('profiles')
  //       .update({ app_audio_enabled: value })
  //       .eq('id', userId);

  //     if (error) console.error('DB update error:', error.message);
  //   } catch (err) {
  //     console.error('Supabase update failed:', err);
  //   }
  // };

  const setAudioState = async (value: boolean) => {
    console.log('Setting audio state to:', value);
    setAudioEnabled(value);
    if (typeof window !== 'undefined')
      localStorage.setItem('audioEnabled', value.toString());
    //await updateDatabase(value);
    if (value) {
      // Small delay to ensure state is updated
      setTimeout(() => playNotificationSound(), 100);
    }
  };

  const toggleAudio = async () => {
    const newValue = !audioEnabled;
    console.log('Toggling audio from', audioEnabled, 'to', newValue);

    // Play sound immediately if enabling (while user gesture is active)
    if (newValue && notificationBell.current) {
      try {
        notificationBell.current.muted = false;
        notificationBell.current.currentTime = 0;
        const playPromise = notificationBell.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Toggle audio play failed:', error);
          });
        }
      } catch (error) {
        console.error('Toggle audio error:', error);
      }
    }

    setAudioEnabled(newValue);
    if (typeof window !== 'undefined')
      localStorage.setItem('audioEnabled', newValue.toString());
    //await updateDatabase(newValue);
  };

  if (!mounted) return null;

  return (
    <AudioContext.Provider
      value={{
        audioEnabled,
        toggleAudio,
        setAudioState,
        playNotificationSound,
        testNotificationSound,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const ctx = useContext(AudioContext);
  if (!ctx)
    throw new Error('useAudioContext must be used within an AudioProvider');
  return ctx;
};