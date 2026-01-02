

import { FaTools } from 'react-icons/fa';
import { Logo } from '../shared/Logo';
import SocialBar from "../shared/SocialBar";

export default function Maintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-brand-secondary text-center px-4 py-12">
      <div className="flex flex-col items-center justify-center flex-grow w-full">
        <Logo className="w-32 h-32 mb-10 mx-auto" />
        <FaTools className="w-10 h-10 text-brand-primary mb-6" aria-label="Maintenance" />
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-center text-text-primary tracking-normal">
          We'll Be Back Soon
        </h1>
        <div className="w-32 h-1 rounded-full bg-brand-primary mb-8 mx-auto" />
        <p className="mb-10 text-base md:text-lg text-muted-foreground text-center max-w-md mx-auto leading-none">
          The site is undergoing scheduled maintenance.<br /><span className="block mt-4">Thank you for your patience.</span><br />
        </p>
      </div>
      <SocialBar variant='inverted' />
    </div>
  );
}
