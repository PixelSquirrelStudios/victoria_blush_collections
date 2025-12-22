import { fetchUserData } from '@/app/hooks/useUser';
import AddServiceForm from '@/components/forms/AddServiceForm';
import { getServiceById } from '@/lib/actions/service.actions';
import { ParamsProps } from '@/types';
import { redirect } from 'next/navigation';

const EditService = async ({
  params,
}: {
  params: ParamsProps;
}) => {
  const paramsData = await params;
  const id = paramsData?.id;

  const service = await getServiceById(id as string);

  console.log('Service Details:', service);
  const userData = await fetchUserData();
  const profile = userData?.profile;

  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <>
      <div className='w-full h-full flex items-center justify-center py-10'>
        <AddServiceForm type='Edit' currentUser={userData} serviceDetails={JSON.stringify(service)} />
      </div>
    </>
  );
};
export default EditService;