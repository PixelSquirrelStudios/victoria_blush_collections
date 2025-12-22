import { fetchUserData } from '@/app/hooks/useUser';
import AddGalleryImageForm from '@/components/forms/AddGalleryImageForm';
import { redirect } from 'next/navigation';

const AddGalleryImagePage = async () => {
  const userData = await fetchUserData();

  if (!userData) {
    redirect('/sign-in');
  }

  return (
    <div className='w-full flex flex-col gap-10'>
      <AddGalleryImageForm type='Create' currentUser={userData.profile} />
    </div>
  );
};

export default AddGalleryImagePage;
