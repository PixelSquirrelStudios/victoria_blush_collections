'use client';

import { FaVolumeMute } from 'react-icons/fa';
import { FaVolumeHigh } from 'react-icons/fa6';
import { useAudioContext } from '@/app/providers/AudioProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const AppSoundsToggle = () => {
  const { audioEnabled, toggleAudio } = useAudioContext();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleAudio}
            aria-label={audioEnabled ? 'Turn App Sounds Off' : 'Turn App Sounds On'}
            className="flex items-center justify-center transition-opacity duration-300 hover:opacity-100 cursor-pointer"
            type="button"
          >
            {audioEnabled ? (
              <FaVolumeHigh className="text-stone-900 text-2xl opacity-85 hover:opacity-100 transition-all" />
            ) : (
              <FaVolumeMute className="text-stone-900 text-2xl opacity-85 hover:opacity-100 transition-all" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={20} className="z-15000 bg-stone-800 text-white">
          {audioEnabled ? 'Turn App Sounds Off' : 'Turn App Sounds On'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};