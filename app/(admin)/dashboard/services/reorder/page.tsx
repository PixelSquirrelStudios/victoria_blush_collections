
import { getAllServices } from '@/lib/actions/service.actions';
import ReorderServicesClient from './ReorderServicesClient';

export default async function ReorderServicesPage() {
  // Fetch services on the server
  const servicesResponse = await getAllServices({
    page: 1,
    page_size: 1000, // Get all services
  });

  const services = servicesResponse.data || [];

  return <ReorderServicesClient initialServices={services} />;
}
