import { useState } from 'react';
import { StudyTask, TaskStatus } from '@/types/study';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Loader2, 
  Plus, 
  Wand2,
  CheckCircle2,
  Calendar,
  BookOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';

interface QuickTaskCreateProps {
  subjects: string[];
  onTaskCreate: (task: Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface AITaskSuggestion {
  title: string;
  description: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDays: number;
}

export const QuickTaskCreate = ({ subjects, onTaskCreate }: QuickTaskCreateProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AITaskSuggestion[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateTasks = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI task generation
      const mockTasks: AITaskSuggestion[] = [
        {
          title: `Study ${prompt}`,
          description: `Complete comprehensive study session on ${prompt} topics`,
          subject: subjects[0] || 'General',
          priority: 'medium',
          difficulty: 'medium',
          estimatedDays: 2
        },
        {
          title: `Practice exercises for ${prompt}`,
          description: `Work through practice problems and examples`,
          subject: subjects[0] || 'General',
          priority: 'high',
          difficulty: 'hard',
          estimatedDays: 1
        },
        {
          title: `Review ${prompt} concepts`,
          description: `Review and consolidate understanding`,
          subject: subjects[0] || 'General',
          priority: 'low',
          difficulty: 'easy',
          estimatedDays: 1
        }
      ];

      setSuggestions(mockTasks);
      setIsExpanded(true);
      
      toast({
        title: "AI Tasks Generated",
        description: `${mockTasks.length} task suggestions created`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createTask = (suggestion: AITaskSuggestion) => {
    const dueDate = addDays(new Date(), suggestion.estimatedDays);
    
    onTaskCreate({
      title: suggestion.title,
      description: suggestion.description,
      subject: suggestion.subject,
      due: dueDate.toISOString().split('T')[0],
      timeSpent: 0,
      status: 'toStudy' as TaskStatus,
      priority: suggestion.priority,
      difficulty: suggestion.difficulty,
      subtasks: []
    });

    toast({
      title: "Task Created",
      description: `"${suggestion.title}" added to your board`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Quick Create Header */}
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI Quick Task Creator</h3>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you need to study (e.g., 'calculus derivatives for exam')"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  generateTasks();
                }
              }}
              className="flex-1"
            />
            <Button 
              onClick={generateTasks}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && isExpanded && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">AI Suggestions</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs h-6"
                >
                  Collapse
                </Button>
              </div>

              <div className="grid gap-2">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => createTask(suggestion)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm">{suggestion.title}</h5>
                            <span className="text-sm">{getDifficultyStars(suggestion.difficulty)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {suggestion.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {suggestion.subject}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                            >
                              {suggestion.priority}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>Due in {suggestion.estimatedDays} day{suggestion.estimatedDays !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            createTask(suggestion);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={generateTasks}
                variant="outline"
                disabled={isGenerating}
                className="w-full text-xs h-8"
              >
                <Zap className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            </div>
          )}

          {/* Collapsed state */}
          {suggestions.length > 0 && !isExpanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="w-full text-xs h-8"
            >
              Show {suggestions.length} AI suggestions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};