import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RxDragHandleDots2 } from 'react-icons/rx';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  type?: string;
  useHandle?: boolean;
}

const SortableItem = ({
  id,
  children,
  type,
  useHandle = true,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (type === 'service') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...(useHandle ? {} : { ...attributes, ...listeners })} // Apply listeners/attributes conditionally
        className='flex w-full touch-none select-none flex-row items-center gap-2'
      >
        {useHandle ? (
          <div className='flex flex-row items-center gap-2'>
            <div
              ref={setActivatorNodeRef} // Use handle if useHandle is true
              {...attributes}
              {...listeners}
              className='cursor-grab'
            >
              <div>
                <RxDragHandleDots2 className='text-3xl text-text-primary' />
              </div>
            </div>
          </div>
        ) : null}
        {children}
      </div>
    );
  }

  // You can add more conditions for other types here
  if (type === 'image') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className='relative touch-none select-none'
      >
        {useHandle && (
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className='absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing bg-black/50 rounded p-1 hover:bg-black/70 transition-colors'
          >
            <RxDragHandleDots2 className='text-2xl text-white' />
          </div>
        )}
        {children}
      </div>
    );
  }

  // Default case (if type is not 'audio' or 'image')
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(useHandle ? {} : { ...attributes, ...listeners })}
      className='flex w-full touch-none select-none flex-row items-center gap-2'
    >
      {useHandle && (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className='cursor-grab'
        >
          <RxDragHandleDots2 className='text-3xl text-white' />
        </div>
      )}
      {children}
    </div>
  );
};

export default SortableItem;
