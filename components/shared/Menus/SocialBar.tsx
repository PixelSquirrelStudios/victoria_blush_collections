import { FaXTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa6';

const SocialBar = () => {
  return (
    <div className='flex flex-row gap-6 py-4'>
      <div className='rounded-full border-2 border-solid border-white p-2'>
        <a href='https://www.facebook.com/lostrecordsfans' target='_blank'>
          <FaFacebookF className='text-lg text-white' />
        </a>
      </div>
      <div className='rounded-full border-2 border-solid border-white p-2'>
        <a href='https://twitter.com/lostrecordsfans' target='_blank'>
          <FaXTwitter className='text-xl text-white' />
        </a>
      </div>
      <div className='rounded-full border-2 border-solid border-white p-2'>
        <a href='https://www.instagram.com/lostrecordsfans/' target='_blank'>
          <FaInstagram className='text-xl text-white' />
        </a>
      </div>
    </div>
  );
};
export default SocialBar;
