import { useMemo } from 'react';
import { StudyData } from '@/types/study';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Brain,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

interface StudyAnalyticsProps {
  data: StudyData;
}

export const StudyAnalytics = ({ data }: StudyAnalyticsProps) => {
  const analytics = useMemo(() => {
    const allTasks = Object.values(data.tasks).flat();
    const completedTasks = data.tasks.completed;
    const totalStudyTime = allTasks.reduce((sum, task) => sum + task.timeSpent, 0);
    
    // Subject breakdown
    const subjectStats = data.userProfile.subjects.map(subject => {
      const subjectTasks = allTasks.filter(task => task.subject === subject);
      const completedCount = subjectTasks.filter(task => task.status === 'completed').length;
      const totalTime = subjectTasks.reduce((sum, task) => sum + task.timeSpent, 0);
      
      return {
        subject,
        total: subjectTasks.length,
        completed: completedCount,
        completionRate: subjectTasks.length > 0 ? (completedCount / subjectTasks.length) * 100 : 0,
        timeSpent: totalTime
      };
    });

    // Priority breakdown
    const priorityStats = ['urgent', 'high', 'medium', 'low'].map(priority => {
      const priorityTasks = allTasks.filter(task => task.priority === priority);
      return {
        priority,
        count: priorityTasks.length,
        completed: priorityTasks.filter(task => task.status === 'completed').length
      };
    });

    // Weekly progress (last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayTasks = completedTasks.filter(task => 
        format(new Date(task.updatedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'MMM dd'),
        completed: dayTasks.length,
        timeSpent: dayTasks.reduce((sum, task) => sum + task.timeSpent, 0) / 3600 // hours
      };
    });

    // Current streak
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);
      const hasCompletedTask = completedTasks.some(task =>
        format(new Date(task.updatedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      if (hasCompletedTask) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      totalStudyTime,
      averageSessionTime: completedTasks.length > 0 ? totalStudyTime / completedTasks.length : 0,
      currentStreak,
      subjectStats,
      priorityStats,
      weeklyData
    };
  }, [data]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <BarChart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Study Analytics</h1>
          <p className="text-muted-foreground">Track your progress and insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Study Time</p>
                <p className="text-2xl font-bold text-primary">
                  {formatTime(analytics.totalStudyTime)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-success">
                  {Math.round(analytics.completionRate)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-warning">
                  {analytics.currentStreak} days
                </p>
              </div>
              <Zap className="w-8 h-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold text-accent">
                  {formatTime(analytics.averageSessionTime)}
                </p>
              </div>
              <Brain className="w-8 h-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Task Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.priorityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="priority"
                >
                  {analytics.priorityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.subjectStats.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{subject.subject}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {subject.completed}/{subject.total} completed
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {formatTime(subject.timeSpent)}
                    </span>
                    <span className="font-medium">
                      {Math.round(subject.completionRate)}%
                    </span>
                  </div>
                </div>
                <Progress value={subject.completionRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};