import { useState, useEffect } from 'react';
import { useStudyData } from '@/hooks/useStudyData';
import { isFirstTime } from '@/lib/storage';
import { FirstTimeSetup } from '@/components/setup/FirstTimeSetup';
import { Navigation, NavigationView } from '@/components/layout/Navigation';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ResourceLibrary } from '@/components/library/ResourceLibrary';

const Index = () => {
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [showSetup, setShowSetup] = useState(false);
  
  const {
    data,
    addSubject,
    createTask,
    updateTask,
    deleteTask,
    createResource,
    updateResource,
    deleteResource
  } = useStudyData();

  // Check if this is the first time user
  useEffect(() => {
    setShowSetup(isFirstTime());
  }, []);

  const handleSetupComplete = (subjects: string[]) => {
    subjects.forEach(subject => addSubject(subject));
    setShowSetup(false);
  };

  // Show setup if it's the first time
  if (showSetup) {
    return <FirstTimeSetup onComplete={handleSetupComplete} />;
  }

  // Calculate task counts for navigation
  const taskCounts = {
    toStudy: data.tasks.toStudy.length,
    inProgress: data.tasks.inProgress.length,
    revision: data.tasks.revision.length,
    completed: data.tasks.completed.length
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <KanbanBoard
            tasks={data.tasks}
            subjects={data.userProfile.subjects}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onTaskCreate={createTask}
          />
        );
      
      case 'library':
        return (
          <ResourceLibrary
            resources={data.resources}
            subjects={data.userProfile.subjects}
            onResourceCreate={createResource}
            onResourceUpdate={updateResource}
            onResourceDelete={deleteResource}
          />
        );
      
      case 'analytics':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <p className="text-muted-foreground">Coming soon - Study analytics and insights</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-muted-foreground">Coming soon - Preferences and configuration</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        taskCounts={taskCounts}
      />
      <main className="flex-1 overflow-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;
