import { useState, useMemo } from 'react';
import { StudyTask, TaskStatus } from '@/types/study';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Timer, 
  Target, 
  Flame,
  BookOpen,
  Brain
} from 'lucide-react';
import { KanbanColumn } from '../kanban/KanbanColumn';
import { CreateTaskDialog } from '../kanban/CreateTaskDialog';
import { TaskCard } from '../kanban/TaskCard';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface StudyDashboardProps {
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
    title: 'Under Revision',
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

export const StudyDashboard = ({ 
  tasks, 
  subjects, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskCreate 
}: StudyDashboardProps) => {
  const [activeTask, setActiveTask] = useState<StudyTask | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Calculate stats
  const stats = useMemo(() => {
    const allTasks = Object.values(tasks).flat();
    const completedTasks = tasks.completed;
    const totalTimeSpent = allTasks.reduce((sum, task) => sum + task.timeSpent, 0);
    
    // Calculate today's study time (tasks completed or worked on today)
    const today = new Date().toDateString();
    const todayTime = allTasks
      .filter(task => new Date(task.updatedAt).toDateString() === today)
      .reduce((sum, task) => sum + task.timeSpent, 0);

    // Simple streak calculation (days with completed tasks)
    const dayStreak = 7; // Placeholder - would calculate from completion history

    return {
      todayTime,
      totalCompleted: completedTasks.length,
      inProgress: tasks.inProgress.length,
      dayStreak
    };
  }, [tasks]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Filter tasks based on search and subject
  const filteredTasks = useMemo(() => {
    const filtered: Record<TaskStatus, StudyTask[]> = {
      toStudy: [],
      inProgress: [],
      revision: [],
      completed: []
    };

    Object.entries(tasks).forEach(([status, taskList]) => {
      filtered[status as TaskStatus] = taskList.filter(task => {
        const matchesSearch = !searchQuery || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSubject = selectedSubject === 'All' || task.subject === selectedSubject;
        
        return matchesSearch && matchesSubject;
      });
    });

    return filtered;
  }, [tasks, searchQuery, selectedSubject]);

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Header with Stats */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">StudyFlow</h1>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTime(stats.todayTime)}
              </div>
              <div className="text-sm text-muted-foreground">Today's Study</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {stats.totalCompleted}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {stats.inProgress}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {stats.dayStreak}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Subject Filters */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Filter by subject:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubject === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject('All')}
                className="h-8"
              >
                All
              </Button>
              {subjects.map(subject => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                  className="h-8"
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Study Board */}
      <div className="flex-1 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Study Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks between columns to organize your workflow
          </p>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[600px]">
            {Object.entries(COLUMN_CONFIG).map(([status, config]) => (
              <KanbanColumn
                key={status}
                id={status as TaskStatus}
                title={config.title}
                icon={config.icon}
                description={config.description}
                color={config.color}
                tasks={filteredTasks[status as TaskStatus]}
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