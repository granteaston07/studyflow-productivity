import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard, Task } from './TaskCard';
import { GripVertical } from 'lucide-react';

interface DraggableTaskCardProps {
  task: Task;
  onToggle: (id: string, showFeedback?: boolean) => Promise<{ task: Task | null; shouldShowFeedback: boolean }>;
  onUpdateDueDate: (id: string, dueDate: Date | undefined) => void;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdatePriority: (id: string, priority: Task['priority']) => void;
  onDelete: (id: string) => void;
  isReorderMode: boolean;
}

export function DraggableTaskCard({ task, onToggle, onUpdateDueDate, onUpdateStatus, onUpdateTitle, onUpdatePriority, onDelete, isReorderMode }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative ${isReorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      {...(isReorderMode ? { ...attributes, ...listeners } : {})}
    >
      {isReorderMode && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-1 rounded hover:bg-muted/50 pointer-events-none">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className={isReorderMode ? 'ml-8' : ''}>
        <TaskCard
          task={task}
          onToggle={onToggle}
          onUpdateDueDate={onUpdateDueDate}
          onUpdateStatus={onUpdateStatus}
          onUpdateTitle={onUpdateTitle}
          onUpdatePriority={onUpdatePriority}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}