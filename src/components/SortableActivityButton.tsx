'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Activity } from '../storage/db';
import ActivityButton from './ActivityButton';

interface SortableActivityButtonProps {
  activity: Activity;
  isActive: boolean;
  activeStartTime?: number;
  isEditMode: boolean;
  onClick: () => void;
}

export function SortableActivityButton({ 
  activity, 
  isActive, 
  activeStartTime, 
  isEditMode,
  onClick 
}: SortableActivityButtonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none' // Prevent scrolling while dragging
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
      <div className={`relative h-full ${isEditMode ? 'animate-pulse-slow' : ''}`}>
        <ActivityButton
          activity={activity}
          isActive={isActive}
          activeStartTime={activeStartTime}
          onClick={onClick}
        />
        {isEditMode && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10">
            ✏️
          </div>
        )}
      </div>
    </div>
  );
}
