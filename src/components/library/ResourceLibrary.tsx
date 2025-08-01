import { useState } from 'react';
import { Resource } from '@/types/study';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  Library,
  ExternalLink,
  Tag,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResourceCard } from './ResourceCard';
import { CreateResourceDialog } from './CreateResourceDialog';
import { searchResources } from '@/lib/storage';

interface ResourceLibraryProps {
  resources: Record<string, Resource[]>;
  subjects: string[];
  onResourceCreate: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  onResourceUpdate: (resource: Resource) => void;
  onResourceDelete: (resourceId: string) => void;
}

export const ResourceLibrary = ({
  resources,
  subjects,
  onResourceCreate,
  onResourceUpdate,
  onResourceDelete
}: ResourceLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get all resources and flatten them
  const allResources = Object.values(resources).flat();
  
  // Get unique tags across all resources
  const allTags = Array.from(
    new Set(allResources.flatMap(resource => resource.tags))
  ).sort();

  // Filter resources based on search and filters
  const filteredResources = allResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    
    const matchesTag = selectedTag === 'all' || resource.tags.includes(selectedTag);

    return matchesSearch && matchesSubject && matchesTag;
  });

  const totalResources = allResources.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold">Resource Library</h1>
          <p className="text-muted-foreground">
            {totalResources} resource{totalResources !== 1 ? 's' : ''} • {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-border bg-muted/20">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Subject Filter */}
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tag Filter */}
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {(selectedSubject !== 'all' || selectedTag !== 'all' || searchQuery) && (
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchQuery}"
              </Badge>
            )}
            {selectedSubject !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Subject: {selectedSubject}
              </Badge>
            )}
            {selectedTag !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Tag: {selectedTag}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedTag('all');
              }}
              className="text-xs h-6"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="px-6 py-3 bg-muted/10 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResources.length} of {totalResources} resources
        </p>
      </div>

      {/* Resources Grid */}
      <div className="flex-1 p-6">
        {totalResources === 0 ? (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center space-y-4 py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Library className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl mb-2">No resources yet</CardTitle>
                <p className="text-muted-foreground mb-4">
                  Start building your knowledge base by adding your first resource.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Resource
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredResources.length === 0 ? (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center space-y-4 py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl mb-2">No results found</CardTitle>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('all');
                    setSelectedTag('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onUpdate={onResourceUpdate}
                onDelete={onResourceDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Resource Dialog */}
      <CreateResourceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        subjects={subjects}
        onResourceCreate={onResourceCreate}
      />
    </div>
  );
};