import { useState } from 'react';
import { Resource } from '@/types/study';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  MoreVertical,
  Calendar,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ResourceCardProps {
  resource: Resource;
  onUpdate: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
}

export const ResourceCard = ({ resource, onUpdate, onDelete }: ResourceCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleOpenLink = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getDomainName = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Invalid URL';
    }
  };

  const faviconUrl = getFaviconUrl(resource.url);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Favicon */}
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              {faviconUrl && !imageError ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-4 h-4"
                  onError={() => setImageError(true)}
                />
              ) : (
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            
            {/* Title and Domain */}
            <div className="flex-1 min-w-0">
              <h3 
                className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors"
                onClick={handleOpenLink}
              >
                {resource.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getDomainName(resource.url)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenLink}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(resource.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Description */}
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {resource.description}
          </p>
        )}

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          {/* Subject */}
          <Badge variant="outline" className="text-xs">
            {resource.subject}
          </Badge>

          {/* Date */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(resource.createdAt), 'MMM d')}</span>
          </div>
        </div>

        {/* Quick Access Button */}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleOpenLink}
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Open Resource
        </Button>
      </CardContent>
    </Card>
  );
};