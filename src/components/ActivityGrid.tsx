'use client';

import { useEffect, useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';

import { useTimeTrackerStore } from '../store/timeTrackerStore';
import ActivityButton from './ActivityButton';
import { SortableActivityButton } from './SortableActivityButton';
import ActivityForm from './ActivityForm';
import { Activity } from '../storage/db';

export default function ActivityGrid() {
  const { 
    activities, 
    activeSession, 
    selectActivity, 
    deleteLastSession, 
    initialize, 
    isLoading,
    isEditMode,
    toggleEditMode,
    reorderActivities,
    addActivity,
    updateActivity,
    deleteActivity
  } = useTimeTrackerStore();

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Require movement before drag
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }), // Hold to drag on mobile
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = activities.findIndex((a) => a.id === active.id);
      const newIndex = activities.findIndex((a) => a.id === over?.id);
      
      const newOrder = arrayMove(activities, oldIndex, newIndex);
      reorderActivities(newOrder);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (isEditMode) {
      setEditingActivity(activity);
    } else {
      selectActivity(activity.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-semibold text-gray-700">
          {isEditMode ? 'Edit Layout' : 'Activities'}
        </h2>
        <button 
          onClick={toggleEditMode}
          className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${isEditMode ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          {isEditMode ? 'Done' : 'Edit'}
        </button>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 overflow-y-auto p-1 pb-4">
          <SortableContext 
            items={activities.map(a => a.id)} 
            strategy={rectSortingStrategy}
          >
            {activities.map((activity) => (
              <SortableActivityButton
                key={activity.id}
                activity={activity}
                isActive={activeSession?.activityId === activity.id}
                activeStartTime={activeSession?.startTime}
                isEditMode={isEditMode}
                onClick={() => handleActivityClick(activity)}
              />
            ))}
          </SortableContext>
          
          {isEditMode && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all aspect-square h-full w-full"
            >
              <span className="text-4xl mb-2">➕</span>
              <span className="font-semibold">Add New</span>
            </button>
          )}
        </div>
      </DndContext>

      {!isEditMode && (
        <div className="absolute bottom-4 right-4 z-10">
          <button 
            onClick={() => {
              if (confirm('Delete last session?')) {
                deleteLastSession();
              }
            }}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center active:scale-95"
            title="Undo / Delete last session"
          >
            <span className="text-xl">↩️</span>
          </button>
        </div>
      )}

      {/* Edit/Add Modals */}
      {(editingActivity || isAdding) && (
        <ActivityForm
          initialData={editingActivity || undefined}
          onSubmit={async (data) => {
            if (editingActivity) {
              await updateActivity(editingActivity.id, data);
              setEditingActivity(null);
            } else {
              await addActivity(data);
              setIsAdding(false);
            }
          }}
          onDelete={editingActivity ? async () => {
             await deleteActivity(editingActivity.id);
             setEditingActivity(null);
          } : undefined}
          onCancel={() => {
            setEditingActivity(null);
            setIsAdding(false);
          }}
        />
      )}
    </div>
  );
}
