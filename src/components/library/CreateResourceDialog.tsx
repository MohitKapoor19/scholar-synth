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
import { Badge } from '@/components/ui/badge';
import { Resource } from '@/types/study';
import { X, Plus, Brain } from 'lucide-react';

interface CreateResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: string[];
  onResourceCreate: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
}

export const CreateResourceDialog = ({ 
  open, 
  onOpenChange, 
  subjects, 
  onResourceCreate 
}: CreateResourceDialogProps) => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    subject: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: '',
      subject: '',
      tags: []
    });
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const extractTitleFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return `Resource from ${domain}`;
    } catch {
      return 'New Resource';
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      url,
      // Auto-generate title if empty
      title: prev.title || extractTitleFromUrl(url)
    }));
  };

  const handleAnalyzeWithAI = async () => {
    if (!formData.url) return;
    
    setIsAnalyzing(true);
    try {
      // This would integrate with your AI service
      // For now, we'll simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated AI response
      const aiAnalysis = {
        title: 'Machine Learning Fundamentals Tutorial',
        description: 'Comprehensive guide covering supervised and unsupervised learning algorithms with practical examples.',
        tags: ['machine-learning', 'tutorial', 'algorithms']
      };
      
      setFormData(prev => ({
        ...prev,
        title: aiAnalysis.title,
        description: aiAnalysis.description,
        tags: [...new Set([...prev.tags, ...aiAnalysis.tags])]
      }));
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url.trim() || !formData.title.trim() || !formData.subject) {
      return;
    }

    onResourceCreate({
      url: formData.url.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject,
      tags: formData.tags
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>
            Save a web resource to your knowledge library. AI can help analyze and categorize it.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/article"
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAnalyzeWithAI}
                disabled={!formData.url || isAnalyzing}
                className="shrink-0"
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
              </Button>
            </div>
            {isAnalyzing && (
              <p className="text-xs text-muted-foreground">AI is analyzing the resource...</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Resource title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief summary or notes about this resource..."
              rows={3}
            />
          </div>

          {/* Subject */}
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

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Tag Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-1"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Resource
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};