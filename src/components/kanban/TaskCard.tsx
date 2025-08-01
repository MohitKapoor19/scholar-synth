import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StudyTask } from '@/types/study';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskTimer } from './TaskTimer';

interface TaskCardProps {
  task: StudyTask;
  onUpdate: (task: StudyTask) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export const TaskCard = ({ task, onUpdate, onDelete, isDragging }: TaskCardProps) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(task.due);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueBadgeVariant = () => {
    const days = getDaysUntilDue();
    if (days < 0) return 'destructive';
    if (days <= 1) return 'destructive';
    if (days <= 3) return 'default';
    return 'secondary';
  };

  const handleTimeUpdate = (newTimeSpent: number) => {
    onUpdate({
      ...task,
      timeSpent: newTimeSpent
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-50 rotate-2 shadow-lg"
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 mb-1">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-2"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Subject */}
        <Badge variant="outline" className="text-xs w-fit">
          {task.subject}
        </Badge>

        {/* Time and Due Date */}
        <div className="space-y-2">
          {/* Time Tracking for In Progress tasks */}
          {task.status === 'inProgress' && (
            <TaskTimer
              taskId={task.id}
              initialTime={task.timeSpent}
              onTimeUpdate={handleTimeUpdate}
            />
          )}
          
          {/* Time spent display for other statuses */}
          {task.status !== 'inProgress' && task.timeSpent > 0 && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTimeSpent(task.timeSpent)}</span>
            </div>
          )}

          {/* Due date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.due), 'MMM d')}</span>
            </div>
            
            {getDaysUntilDue() <= 3 && (
              <Badge variant={getDueBadgeVariant()} className="text-xs">
                {getDaysUntilDue() === 0 ? 'Today' : 
                 getDaysUntilDue() === 1 ? 'Tomorrow' :
                 getDaysUntilDue() < 0 ? 'Overdue' : 
                 `${getDaysUntilDue()}d`}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};