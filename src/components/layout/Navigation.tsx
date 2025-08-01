import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Library, 
  Settings, 
  Brain,
  Timer,
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavigationView = 'dashboard' | 'library' | 'analytics' | 'settings';

interface NavigationProps {
  currentView: NavigationView;
  onViewChange: (view: NavigationView) => void;
  taskCounts?: {
    toStudy: number;
    inProgress: number;
    revision: number;
    completed: number;
  };
}

export const Navigation = ({ currentView, onViewChange, taskCounts }: NavigationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as NavigationView,
      label: 'Study Board',
      icon: LayoutDashboard,
      badge: taskCounts ? taskCounts.toStudy + taskCounts.inProgress + taskCounts.revision : 0
    },
    {
      id: 'library' as NavigationView,
      label: 'Resource Library',
      icon: Library,
      badge: 0
    },
    {
      id: 'analytics' as NavigationView,
      label: 'Analytics',
      icon: TrendingUp,
      badge: 0
    },
    {
      id: 'settings' as NavigationView,
      label: 'Settings',
      icon: Settings,
      badge: 0
    }
  ];

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">StudyMaster</h1>
              <p className="text-xs text-muted-foreground">AI Study Planner</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {!isCollapsed && taskCounts && (
        <div className="p-4 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Tasks</span>
              <Badge variant="secondary">
                {taskCounts.toStudy + taskCounts.inProgress + taskCounts.revision}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">In Progress</span>
              <div className="flex items-center space-x-1">
                <Timer className="w-3 h-3 text-warning" />
                <span className="text-warning font-medium">{taskCounts.inProgress}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-11",
                  isCollapsed ? "px-2" : "px-3"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge > 0 && (
                      <Badge 
                        variant={isActive ? "secondary" : "default"} 
                        className="ml-2 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </Button>
      </div>
    </div>
  );
};