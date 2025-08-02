import { useState } from 'react';
import { StudyTask, SubTask } from '@/types/study';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Brain, 
  Loader2, 
  CheckCircle2, 
  Plus,
  Zap,
  Target,
  Clock,
  Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AIBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: StudyTask | null;
  onTaskUpdate: (task: StudyTask) => void;
}

interface AISubtaskSuggestion {
  title: string;
  description: string;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
}

export const AIBreakdownDialog = ({ 
  open, 
  onOpenChange, 
  task, 
  onTaskUpdate 
}: AIBreakdownDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISubtaskSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [customPrompt, setCustomPrompt] = useState('');

  const generateSubtasks = async (prompt?: string) => {
    if (!task) return;
    
    setIsGenerating(true);
    try {
      // Simulate AI API call - replace with actual AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI suggestions based on task
      const mockSuggestions: AISubtaskSuggestion[] = [
        {
          title: `Research fundamentals of ${task.subject}`,
          description: `Gather basic information and key concepts for ${task.title}`,
          estimatedTime: 30,
          difficulty: 'easy'
        },
        {
          title: `Create outline and structure`,
          description: `Organize main points and create a logical flow`,
          estimatedTime: 20,
          difficulty: 'medium'
        },
        {
          title: `Deep dive into core concepts`,
          description: `Study the most important aspects in detail`,
          estimatedTime: 45,
          difficulty: 'hard'
        },
        {
          title: `Practice exercises and examples`,
          description: `Apply knowledge through practical exercises`,
          estimatedTime: 60,
          difficulty: 'medium'
        },
        {
          title: `Review and summarize`,
          description: `Create summary notes and identify key takeaways`,
          estimatedTime: 25,
          difficulty: 'easy'
        }
      ];

      setSuggestions(mockSuggestions);
      setSelectedSuggestions(new Set([0, 1, 2])); // Pre-select first 3
      
      toast({
        title: "AI Suggestions Generated",
        description: `${mockSuggestions.length} subtasks suggested for "${task.title}"`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const applySelectedSuggestions = () => {
    if (!task) return;

    const newSubtasks: SubTask[] = Array.from(selectedSuggestions).map(index => {
      const suggestion = suggestions[index];
      return {
        id: `subtask-${Date.now()}-${index}`,
        title: suggestion.title,
        completed: false,
        createdAt: new Date().toISOString()
      };
    });

    const updatedTask = {
      ...task,
      subtasks: [...task.subtasks, ...newSubtasks]
    };

    onTaskUpdate(updatedTask);
    
    toast({
      title: "Subtasks Added",
      description: `${newSubtasks.length} subtasks added to "${task.title}"`,
    });
    
    onOpenChange(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const totalEstimatedTime = Array.from(selectedSuggestions)
    .reduce((total, index) => total + suggestions[index]?.estimatedTime || 0, 0);

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Task Breakdown
          </DialogTitle>
          <DialogDescription>
            Let AI break down "{task.title}" into manageable subtasks
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Task Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{task.title}</h3>
                  <Badge variant="secondary">{task.subject}</Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due {format(new Date(task.due), 'MMM dd')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{task.priority} priority</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Instructions (Optional)</label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific requirements or focus areas for the breakdown..."
              rows={2}
            />
          </div>

          {/* Generate Button */}
          {suggestions.length === 0 && (
            <Button 
              onClick={() => generateSubtasks(customPrompt)}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Breakdown...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Subtask Breakdown
                </>
              )}
            </Button>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">AI Suggestions</h4>
                <div className="text-sm text-muted-foreground">
                  {selectedSuggestions.size} selected • {formatTime(totalEstimatedTime)} estimated
                </div>
              </div>

              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all ${
                      selectedSuggestions.has(index) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSuggestion(index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                          {selectedSuggestions.has(index) ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">{suggestion.title}</h5>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}
                              >
                                {suggestion.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(suggestion.estimatedTime)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={() => generateSubtasks(customPrompt)}
                variant="outline"
                disabled={isGenerating}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Regenerate Suggestions
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {suggestions.length > 0 && (
            <Button 
              onClick={applySelectedSuggestions}
              disabled={selectedSuggestions.size === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {selectedSuggestions.size} Subtasks
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};