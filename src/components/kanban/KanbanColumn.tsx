import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StudyTask, TaskStatus } from '@/types/study';
import { TaskCardEnhanced } from './TaskCardEnhanced';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  icon: string;
  description: string;
  color: string;
  tasks: StudyTask[];
  onTaskUpdate: (task: StudyTask) => void;
  onTaskDelete: (taskId: string) => void;
  onAIBreakdown?: (task: StudyTask) => void;
}

export const KanbanColumn = ({ 
  id, 
  title, 
  icon, 
  description, 
  color, 
  tasks, 
  onTaskUpdate, 
  onTaskDelete,
  onAIBreakdown = () => {}
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full transition-colors duration-200",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{icon}</span>
            <div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[200px]">
            {tasks.map((task) => (
            <TaskCardEnhanced
              key={task.id}
              task={task}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              onAIBreakdown={onAIBreakdown}
            />
            ))}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Drop tasks here</p>
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
};