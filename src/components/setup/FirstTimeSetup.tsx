import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, BookOpen, Brain } from 'lucide-react';
import { getDefaultSubjects } from '@/lib/storage';

interface FirstTimeSetupProps {
  onComplete: (subjects: string[]) => void;
}

export const FirstTimeSetup = ({ onComplete }: FirstTimeSetupProps) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [step, setStep] = useState<'welcome' | 'subjects' | 'ready'>('welcome');

  const defaultSubjects = getDefaultSubjects();

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const addDefaultSubject = (subject: string) => {
    if (!subjects.includes(subject)) {
      setSubjects([...subjects, subject]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSubject();
    }
  };

  const handleComplete = () => {
    if (subjects.length > 0) {
      onComplete(subjects);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome to StudyMaster</CardTitle>
              <CardDescription className="text-base mt-2">
                Your AI-powered study companion for academic success
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Organize Your Studies</h3>
                  <p className="text-sm text-muted-foreground">Kanban boards for task management</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">AI-Powered Learning</h3>
                  <p className="text-sm text-muted-foreground">Smart planning and resource analysis</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setStep('subjects')} 
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'subjects') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Set Up Your Subjects</CardTitle>
            <CardDescription>
              Add the subjects you're currently studying. You can always modify these later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add custom subject */}
            <div className="space-y-2">
              <Label htmlFor="new-subject">Add a subject</Label>
              <div className="flex space-x-2">
                <Input
                  id="new-subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Quantum Physics, Spanish Literature..."
                  className="flex-1"
                />
                <Button onClick={addSubject} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick add common subjects */}
            <div className="space-y-2">
              <Label>Quick add common subjects</Label>
              <div className="flex flex-wrap gap-2">
                {defaultSubjects.map(subject => (
                  <Button
                    key={subject}
                    variant="outline"
                    size="sm"
                    onClick={() => addDefaultSubject(subject)}
                    disabled={subjects.includes(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current subjects */}
            {subjects.length > 0 && (
              <div className="space-y-2">
                <Label>Your subjects ({subjects.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(subject => (
                    <Badge key={subject} variant="default" className="pl-3 pr-1 py-1">
                      {subject}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-1"
                        onClick={() => removeSubject(subject)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => setStep('welcome')}>
                Back
              </Button>
              <Button 
                onClick={() => setStep('ready')} 
                className="flex-1"
                disabled={subjects.length === 0}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-success to-accent rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">You're All Set!</CardTitle>
            <CardDescription>
              Your study environment is ready. Let's start organizing your academic journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Subjects Added: {subjects.length}</h3>
              <div className="flex flex-wrap gap-1">
                {subjects.map(subject => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Enter StudyMaster
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};