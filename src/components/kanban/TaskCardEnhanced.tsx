import { useState } from 'react';
import { StudyTask, SubTask } from '@/types/study';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  Calendar, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Target,
  Brain,
  CheckCircle2,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { TaskTimer } from './TaskTimer';
import { cn } from '@/lib/utils';

interface TaskCardEnhancedProps {
  task: StudyTask;
  onUpdate: (task: StudyTask) => void;
  onDelete: (taskId: string) => void;
  onAIBreakdown: (task: StudyTask) => void;
  isDragging?: boolean;
}

export const TaskCardEnhanced = ({ 
  task, 
  onUpdate, 
  onDelete, 
  onAIBreakdown,
  isDragging = false 
}: TaskCardEnhancedProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      default: return 'border-l-gray-300';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      default: return '⭐⭐';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: `subtask-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      onUpdate({
        ...task,
        subtasks: [...task.subtasks, newSubtask]
      });

      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    onUpdate({
      ...task,
      subtasks: updatedSubtasks
    });
  };

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    onUpdate({
      ...task,
      subtasks: updatedSubtasks
    });
  };

  const dueDate = new Date(task.due);
  const isOverdue = dueDate < new Date() && task.status !== 'completed';
  const isDueSoon = dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000) && !isOverdue;

  return (
    <Card className={cn(
      "transition-all duration-200 cursor-grab active:cursor-grabbing border-l-4",
      getPriorityColor(task.priority),
      isDragging && "rotate-3 scale-105 shadow-xl",
      isOverdue && "ring-2 ring-red-500 ring-opacity-50",
      isDueSoon && "ring-2 ring-yellow-500 ring-opacity-50"
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm line-clamp-2">{task.title}</h3>
              <span className="text-sm">{getDifficultyStars(task.difficulty)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {task.subject}
              </Badge>
              <span>{getPriorityEmoji(task.priority)}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAIBreakdown(task)}>
                <Brain className="w-4 h-4 mr-2" />
                AI Breakdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                <Target className="w-4 h-4 mr-2" />
                {isExpanded ? 'Collapse' : 'Expand'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Progress & Subtasks Summary */}
        {totalSubtasks > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Time & Due Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTime(task.timeSpent)}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1",
            isOverdue && "text-red-600 font-medium",
            isDueSoon && "text-yellow-600 font-medium"
          )}>
            <Calendar className="w-3 h-3" />
            <span>{format(dueDate, 'MMM dd')}</span>
          </div>
        </div>

        {/* Timer for In Progress tasks */}
        {task.status === 'inProgress' && (
          <TaskTimer
            taskId={task.id}
            initialTime={task.timeSpent}
            onTimeUpdate={(newTime) => onUpdate({ ...task, timeSpent: newTime })}
          />
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-6 p-0 text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              More ({totalSubtasks} subtasks)
            </>
          )}
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            {/* Subtasks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium">Subtasks</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingSubtask(true)}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={subtask.id}
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                  />
                  <label
                    htmlFor={subtask.id}
                    className={cn(
                      "flex-1 text-xs cursor-pointer",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubtask(subtask.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {isAddingSubtask && (
                <div className="flex items-center space-x-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Enter subtask..."
                    className="text-xs h-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addSubtask();
                      if (e.key === 'Escape') {
                        setIsAddingSubtask(false);
                        setNewSubtaskTitle('');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addSubtask}
                    className="h-8 px-2"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* AI Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAIBreakdown(task)}
                className="flex-1 h-8 text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                AI Break Down
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};