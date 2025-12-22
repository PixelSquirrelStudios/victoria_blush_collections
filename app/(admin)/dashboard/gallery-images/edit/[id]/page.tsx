import { fetchUserData } from '@/app/hooks/useUser';
import AddGalleryImageForm from '@/components/forms/AddGalleryImageForm';
import { getGalleryImageById } from '@/lib/actions/image.actions';
import { ParamsProps } from '@/types';
import { redirect } from 'next/navigation';

const EditGalleryImage = async ({
  params,
}: {
  params: ParamsProps;
}) => {
  const paramsData = await params;
  const id = paramsData?.id;

  const image = await getGalleryImageById(id as string);

  console.log('Image Details:', image);
  const userData = await fetchUserData();
  const profile = userData?.profile;

  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <>
      <div className='w-full h-full flex items-center justify-center py-10'>
        <AddGalleryImageForm type='Edit' currentUser={userData} imageDetails={JSON.stringify(image)} />
      </div>
    </>
  );
};
export default EditGalleryImage;