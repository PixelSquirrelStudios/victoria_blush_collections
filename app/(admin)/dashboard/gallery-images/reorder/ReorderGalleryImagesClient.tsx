'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import SortableItem from '@/components/shared/SortableItem';
import GalleryImageCard from '@/components/cards/GalleryImageCard';
import GalleryImageCardListAdmin from '@/components/cards/GalleryImageCardListAdmin';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { showCustomToast } from '@/components/shared/CustomToast';
import { updateGalleryImagesOrder } from '@/lib/actions/image.actions';

interface Category {
  id: string;
  name: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
  categories_images: { categories: Category | Category[]; }[];
}

interface ReorderGalleryImagesClientProps {
  initialImages: GalleryImage[];
}

export default function ReorderGalleryImagesClient({
  initialImages,
}: ReorderGalleryImagesClientProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle deletion by updating local state
  const handleDelete = (deletedId: string) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== deletedId));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setImages((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);

      // Create the update payload with new sort_order values
      const updates = images.map((image, index) => ({
        id: image.id,
        sort_order: index + 1,
      }));

      await updateGalleryImagesOrder(updates);

      showCustomToast({
        title: 'Success',
        message: 'Gallery images order updated successfully!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving order:', error);
      showCustomToast({
        title: 'Error',
        message: 'Failed to save order. Please try again.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Reorder Gallery Images
            </h1>
            <p className="text-text-body mt-1">
              Drag and drop to change the order of images
            </p>
          </div>
          {/* View Toggle */}
          <div className="flex">
            <Button
              onClick={() => setViewMode('list')}
              className={`gap-2 font-semibold rounded-r-none border-r border-border-default ${viewMode === 'list'
                ? 'bg-brand-secondary hover:bg-brand-secondary/90 text-text-primary transition-all duration-300'
                : 'bg-brand-secondary/50 hover:bg-brand-secondary/90 text-text-primary transition-all duration-300'
                }`}
            >
              <List className="h-4 w-4" />
              List View
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              className={`gap-2 font-semibold rounded-l-none ${viewMode === 'grid'
                ? 'bg-brand-secondary hover:bg-brand-secondary/90 text-text-primary transition-all duration-300'
                : 'bg-brand-secondary/50 hover:bg-brand-secondary/90 text-text-primary transition-all duration-300'
                }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid View
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/gallery-images">
              <Button variant="outline" className="gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-text-primary font-semibold">
                <ArrowLeft className="h-4 w-4" />
                Back to Images
              </Button>
            </Link>
            <Button
              onClick={handleSaveOrder}
              disabled={saving}
              className="gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-text-primary font-semibold w-[140px]"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Order'}
            </Button>
          </div>
        </div>

        {/* Sortable Grid */}
        {images.length === 0 ? (
          <div className="text-center py-12 text-text-body">
            No images found.
          </div>
        ) : !mounted ? (
          <div className="text-center py-12 text-text-body">
            Loading...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {images.map((image) => {
                    const categories =
                      image.categories_images
                        ?.map((ci) => {
                          const cat = ci.categories;
                          return Array.isArray(cat) ? cat[0] : cat;
                        })
                        .filter(Boolean) || [];

                    return (
                      <SortableItem
                        key={image.id}
                        id={image.id}
                        type="service"
                        useHandle={true}
                      >
                        <div className="flex-1">
                          <GalleryImageCardListAdmin
                            id={image.id}
                            image_url={image.image_url}
                            title={image.title}
                            categories={categories}
                            onDelete={handleDelete}
                          />
                        </div>
                      </SortableItem>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {images.map((image) => {
                    const categories =
                      image.categories_images
                        ?.map((ci) => {
                          const cat = ci.categories;
                          return Array.isArray(cat) ? cat[0] : cat;
                        })
                        .filter(Boolean) || [];

                    return (
                      <SortableItem
                        key={image.id}
                        id={image.id}
                        type="image"
                        useHandle={true}
                      >
                        <GalleryImageCard
                          id={image.id}
                          image_url={image.image_url}
                          title={image.title}
                          description={image.description}
                          categories={categories}
                          isAdmin={true}
                          onDelete={handleDelete}
                        />
                      </SortableItem>
                    );
                  })}
                </div>
              )}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
