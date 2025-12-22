import { fetchUserData } from '@/app/hooks/useUser';
import AddServiceForm from '@/components/forms/AddServiceForm';
import { redirect } from 'next/navigation';

const AddService = async () => {
  const userData = await fetchUserData();
  const profile = userData?.profile;

  if (!profile) {
    redirect("/sign-in");
  }
  return (
    <>
      <div className='w-full h-full flex items-center justify-center py-10'>
        <AddServiceForm type='Create' currentUser={userData} />
      </div>
    </>
  );
};
export default AddService;