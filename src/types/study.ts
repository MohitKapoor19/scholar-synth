// Core TypeScript interfaces for the Study Planner & Resource Library

export type TaskStatus = 'toStudy' | 'inProgress' | 'revision' | 'completed';

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  subject: string;
  due: string; // ISO date string
  timeSpent: number; // seconds
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  difficulty: 'easy' | 'medium' | 'hard';
  subtasks: SubTask[];
  parentTaskId?: string; // For subtasks
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  url: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  createdAt: string; // ISO timestamp
}

export interface UserProfile {
  subjects: string[];
}

export interface StudyData {
  userProfile: UserProfile;
  tasks: Record<TaskStatus, StudyTask[]>;
  resources: Record<string, Resource[]>;
}

export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  totalTime: number;
}

// AI Integration Types
export interface AITaskCreationRequest {
  userInput: string;
  subjects: string[];
}

export interface AITaskCreationResponse {
  title: string;
  description?: string;
  due: string;
  subject: string;
}

export interface AIStudyPlanRequest {
  goal: string;
  timeframe: string;
  subjects: string[];
}

export interface AIStudyPlanResponse {
  tasks: Omit<StudyTask, 'id' | 'timeSpent' | 'status' | 'createdAt' | 'updatedAt'>[];
}

export interface AIResourceAnalysisRequest {
  url: string;
  content?: string;
}

export interface AIResourceAnalysisResponse {
  summary: string[];
  tags: string[];
  suggestedTitle?: string;
}

export interface AIRevisionScheduleRequest {
  completedTask: StudyTask;
}

export interface AIRevisionScheduleResponse {
  revisionTasks: Omit<StudyTask, 'id' | 'timeSpent' | 'status' | 'createdAt' | 'updatedAt'>[];
}