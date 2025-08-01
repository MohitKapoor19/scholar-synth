// Custom hook for managing study data state
import { useState, useEffect, useCallback } from 'react';
import { StudyData, StudyTask, Resource, TaskStatus } from '@/types/study';
import { loadStudyData, saveStudyData, updateTask, addResource } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export const useStudyData = () => {
  const [data, setData] = useState<StudyData>(loadStudyData);
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveStudyData(data);
  }, [data]);

  const updateStudyData = useCallback((newData: StudyData) => {
    setData(newData);
  }, []);

  const addSubject = useCallback((subject: string) => {
    setData(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        subjects: [...prev.userProfile.subjects, subject]
      },
      resources: {
        ...prev.resources,
        [subject]: []
      }
    }));
  }, []);

  const removeSubject = useCallback((subject: string) => {
    setData(prev => {
      const newResources = { ...prev.resources };
      delete newResources[subject];
      
      // Remove tasks with this subject
      const newTasks = { ...prev.tasks };
      Object.keys(newTasks).forEach(status => {
        newTasks[status as TaskStatus] = newTasks[status as TaskStatus].filter(
          task => task.subject !== subject
        );
      });

      return {
        ...prev,
        userProfile: {
          ...prev.userProfile,
          subjects: prev.userProfile.subjects.filter(s => s !== subject)
        },
        resources: newResources,
        tasks: newTasks
      };
    });
  }, []);

  const createTask = useCallback((taskData: Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [newTask.status]: [...prev.tasks[newTask.status], newTask]
      }
    }));

    return newTask;
  }, []);

  const updateTaskData = useCallback((updatedTask: StudyTask) => {
    const taskWithUpdatedTime = {
      ...updatedTask,
      updatedAt: new Date().toISOString()
    };

    setData(prev => updateTask(prev, taskWithUpdatedTime));
    return taskWithUpdatedTime;
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setData(prev => {
      const newTasks = { ...prev.tasks };
      Object.keys(newTasks).forEach(status => {
        newTasks[status as TaskStatus] = newTasks[status as TaskStatus].filter(
          task => task.id !== taskId
        );
      });
      return { ...prev, tasks: newTasks };
    });
  }, []);

  const createResource = useCallback((resourceData: Omit<Resource, 'id' | 'createdAt'>) => {
    const newResource: Resource = {
      ...resourceData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };

    setData(prev => addResource(prev, newResource));
    return newResource;
  }, []);

  const updateResource = useCallback((updatedResource: Resource) => {
    setData(prev => {
      const newResources = { ...prev.resources };
      
      // Find and update resource across all subjects
      Object.keys(newResources).forEach(subject => {
        const resourceIndex = newResources[subject].findIndex(r => r.id === updatedResource.id);
        if (resourceIndex !== -1) {
          newResources[subject][resourceIndex] = updatedResource;
        }
      });

      return { ...prev, resources: newResources };
    });
  }, []);

  const deleteResource = useCallback((resourceId: string) => {
    setData(prev => {
      const newResources = { ...prev.resources };
      
      Object.keys(newResources).forEach(subject => {
        newResources[subject] = newResources[subject].filter(r => r.id !== resourceId);
      });

      return { ...prev, resources: newResources };
    });
  }, []);

  return {
    data,
    isLoading,
    setIsLoading,
    updateStudyData,
    addSubject,
    removeSubject,
    createTask,
    updateTask: updateTaskData,
    deleteTask,
    createResource,
    updateResource,
    deleteResource
  };
};