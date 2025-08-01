// Local storage management for the Study Planner
import { StudyData, StudyTask, Resource } from '@/types/study';

const STORAGE_KEY = 'study_planner_data';

const DEFAULT_SUBJECTS = [
  'Computer Science',
  'Mathematics', 
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Literature',
  'Languages'
];

export const getDefaultStudyData = (): StudyData => ({
  userProfile: {
    subjects: []
  },
  tasks: {
    toStudy: [],
    inProgress: [],
    revision: [],
    completed: []
  },
  resources: {}
});

export const loadStudyData = (): StudyData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultStudyData();
    }
    
    const data = JSON.parse(stored) as StudyData;
    
    // Ensure all required properties exist (data migration)
    const defaultData = getDefaultStudyData();
    return {
      userProfile: { ...defaultData.userProfile, ...data.userProfile },
      tasks: { ...defaultData.tasks, ...data.tasks },
      resources: { ...defaultData.resources, ...data.resources }
    };
  } catch (error) {
    console.error('Error loading study data:', error);
    return getDefaultStudyData();
  }
};

export const saveStudyData = (data: StudyData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving study data:', error);
  }
};

export const isFirstTime = (): boolean => {
  const data = loadStudyData();
  return data.userProfile.subjects.length === 0;
};

export const getDefaultSubjects = (): string[] => DEFAULT_SUBJECTS;

// Helper functions for working with tasks and resources
export const findTaskById = (data: StudyData, taskId: string): StudyTask | null => {
  for (const status of Object.keys(data.tasks) as Array<keyof typeof data.tasks>) {
    const task = data.tasks[status].find(t => t.id === taskId);
    if (task) return task;
  }
  return null;
};

export const updateTask = (data: StudyData, updatedTask: StudyTask): StudyData => {
  const newData = { ...data };
  
  // Remove task from all columns first
  for (const status of Object.keys(newData.tasks) as Array<keyof typeof newData.tasks>) {
    newData.tasks[status] = newData.tasks[status].filter(t => t.id !== updatedTask.id);
  }
  
  // Add to correct column
  newData.tasks[updatedTask.status].push(updatedTask);
  
  return newData;
};

export const addResource = (data: StudyData, resource: Resource): StudyData => {
  const newData = { ...data };
  
  if (!newData.resources[resource.subject]) {
    newData.resources[resource.subject] = [];
  }
  
  newData.resources[resource.subject].push(resource);
  return newData;
};

export const searchResources = (data: StudyData, query: string, subject?: string): Resource[] => {
  const allResources = subject 
    ? data.resources[subject] || []
    : Object.values(data.resources).flat();
    
  if (!query.trim()) return allResources;
  
  const searchTerm = query.toLowerCase();
  return allResources.filter(resource => 
    resource.title.toLowerCase().includes(searchTerm) ||
    resource.description.toLowerCase().includes(searchTerm) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};