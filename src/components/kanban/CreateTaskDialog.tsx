import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudyTask, TaskStatus } from '@/types/study';
import { format } from 'date-fns';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: string[];
  onTaskCreate: (task: Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CreateTaskDialog = ({ 
  open, 
  onOpenChange, 
  subjects, 
  onTaskCreate 
}: CreateTaskDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    due: '',
    status: 'toStudy' as TaskStatus,
    priority: 'medium' as const,
    difficulty: 'medium' as const
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      due: '',
      status: 'toStudy',
      priority: 'medium',
      difficulty: 'medium'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.subject || !formData.due) {
      return;
    }

    onTaskCreate({
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject,
      due: formData.due,
      timeSpent: 0,
      status: formData.status,
      priority: formData.priority,
      difficulty: formData.difficulty,
      subtasks: []
    });

    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = format(tomorrow, 'yyyy-MM-dd');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new study task to your board. You can organize it later using drag and drop.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Complete calculus homework"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional details about the task..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toStudy">To Study</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="revision">For Revision</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">⭐ Easy</SelectItem>
                  <SelectItem value="medium">⭐⭐ Medium</SelectItem>
                  <SelectItem value="hard">⭐⭐⭐ Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due">Due Date *</Label>
            <Input
              id="due"
              type="date"
              value={formData.due || defaultDate}
              onChange={(e) => setFormData(prev => ({ ...prev, due: e.target.value }))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};