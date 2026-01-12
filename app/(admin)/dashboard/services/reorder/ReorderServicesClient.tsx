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
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import SortableItem from '@/components/shared/SortableItem';
import ServiceCardListAdmin from '@/components/cards/ServiceCardListAdmin';
import ServiceCard from '@/components/cards/ServiceCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { showCustomToast } from '@/components/shared/CustomToast';
import { updateServicesOrder } from '@/lib/actions/service.actions';

interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  is_highlighted: boolean;
  sort_order: number;
  created_at: string;
  categories_services: { categories: Category | Category[]; }[];
}

interface ReorderServicesClientProps {
  initialServices: Service[];
}

export default function ReorderServicesClient({
  initialServices,
}: ReorderServicesClientProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle deletion by updating local state
  const handleDelete = (deletedId: string) => {
    setServices((prevServices) => prevServices.filter((service) => service.id !== deletedId));
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

    setServices((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);

      // Create the update payload with new sort_order values
      const updates = services.map((service, index) => ({
        id: service.id,
        sort_order: index + 1,
      }));

      await updateServicesOrder(updates);

      showCustomToast({
        title: 'Success',
        message: 'Service order updated successfully!',
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
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Reorder Services
          </h1>
          <p className="text-text-body mt-1">
            Drag and drop to change the order of services
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
          <Link href="/dashboard/services">
            <Button variant="outline" className="gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-text-primary font-semibold">
              <ArrowLeft className="h-4 w-4" />
              Back to Services
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

      <div className="w-full">
        <div className="w-full">
          {/* Sortable List */}
          {services.length === 0 ? (
            <div className="text-center py-12 text-text-body">
              No services found.
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
                items={services.map((s) => s.id)}
                strategy={viewMode === 'list' ? verticalListSortingStrategy : rectSortingStrategy}
              >
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    {services.map((service) => {
                      const categories =
                        service.categories_services
                          ?.map((cs) => {
                            const cat = cs.categories;
                            return Array.isArray(cat) ? cat[0] : cat;
                          })
                          .filter(Boolean) || [];

                      return (
                        <SortableItem
                          key={service.id}
                          id={service.id}
                          type="service"
                          useHandle={true}
                        >
                          <div className="flex-1">
                            <ServiceCardListAdmin
                              id={service.id}
                              icon={service.icon}
                              title={service.title}
                              price={service.price}
                              categories={categories}
                              highlight={service.is_highlighted}
                              onDelete={handleDelete}
                            />
                          </div>
                        </SortableItem>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
                    {services.map((service) => {
                      const categories =
                        service.categories_services
                          ?.map((cs) => {
                            const cat = cs.categories;
                            return Array.isArray(cat) ? cat[0] : cat;
                          })
                          .filter(Boolean) || [];

                      return (
                        <SortableItem
                          key={service.id}
                          id={service.id}
                          type="image"
                          useHandle={true}
                        >
                          <ServiceCard
                            id={service.id}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                            price={service.price}
                            categories={categories}
                            highlight={service.is_highlighted}
                            onDelete={handleDelete}
                            isAdmin={true}
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
    </div>
  );
}
