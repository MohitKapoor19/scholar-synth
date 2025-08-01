import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { StudyTask, TaskStatus } from '@/types/study';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KanbanBoardProps {
  tasks: Record<TaskStatus, StudyTask[]>;
  subjects: string[];
  onTaskUpdate: (task: StudyTask) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskCreate: (task: Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const COLUMN_CONFIG = {
  toStudy: {
    title: 'To Study',
    icon: '📚',
    description: 'Tasks ready to begin',
    color: 'to-study'
  },
  inProgress: {
    title: 'In Progress', 
    icon: '⏳',
    description: 'Currently working on',
    color: 'in-progress'
  },
  revision: {
    title: 'For Revision',
    icon: '📝', 
    description: 'Ready for review',
    color: 'revision'
  },
  completed: {
    title: 'Completed',
    icon: '✅',
    description: 'Finished tasks',
    color: 'completed'
  }
} as const;

export const KanbanBoard = ({ 
  tasks, 
  subjects, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskCreate 
}: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<StudyTask | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = findTaskById(taskId);
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = findTaskById(taskId);
    if (!task) return;

    const overId = over.id as string;
    
    // Check if dropped on a different column
    if (Object.keys(COLUMN_CONFIG).includes(overId)) {
      const newStatus = overId as TaskStatus;
      if (task.status !== newStatus) {
        onTaskUpdate({
          ...task,
          status: newStatus
        });
      }
    }
  };

  const findTaskById = (taskId: string): StudyTask | null => {
    for (const status of Object.keys(tasks) as TaskStatus[]) {
      const task = tasks[status].find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const totalTasks = Object.values(tasks).flat().length;
  const activeTasks = tasks.toStudy.length + tasks.inProgress.length + tasks.revision.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold">Study Board</h1>
          <p className="text-muted-foreground">
            {activeTasks} active task{activeTasks !== 1 ? 's' : ''} • {tasks.completed.length} completed
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center space-x-4 p-6 bg-muted/20">
        {Object.entries(COLUMN_CONFIG).map(([status, config]) => (
          <div key={status} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-${config.color}`} />
            <span className="text-sm font-medium">
              {config.title}: {tasks[status as TaskStatus].length}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6">
        {totalTasks === 0 ? (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center space-y-4 py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl mb-2">No tasks yet</CardTitle>
                <p className="text-muted-foreground mb-4">
                  Create your first study task to get started with your academic journey.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
              {Object.entries(COLUMN_CONFIG).map(([status, config]) => (
                <KanbanColumn
                  key={status}
                  id={status as TaskStatus}
                  title={config.title}
                  icon={config.icon}
                  description={config.description}
                  color={config.color}
                  tasks={tasks[status as TaskStatus]}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        subjects={subjects}
        onTaskCreate={onTaskCreate}
      />
    </div>
  );
};