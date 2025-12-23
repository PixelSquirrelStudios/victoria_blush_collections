
import { getAllGalleryImages } from '@/lib/actions/image.actions';
import ReorderGalleryImagesClient from './ReorderGalleryImagesClient';

export default async function ReorderGalleryImagesPage() {
  // Fetch images on the server
  const imagesResponse = await getAllGalleryImages({
    page: 1,
    page_size: 1000, // Get all images
  });

  const images = imagesResponse.data || [];

  return <ReorderGalleryImagesClient initialImages={images} />;
}
