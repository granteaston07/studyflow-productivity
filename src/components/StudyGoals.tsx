import { useState } from 'react';
import { Plus, Target, Calendar, Clock, CheckCircle, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGoals, StudyGoal } from '@/hooks/useGoals';
import { format } from 'date-fns';

export function StudyGoals() {
  const { goals, loading, addGoal, deleteGoal } = useGoals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: '',
    target_type: 'hours' as 'hours' | 'sessions' | 'tasks',
    target_period: 'weekly' as 'daily' | 'weekly' | 'monthly',
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.target_value) return;

    await addGoal({
      title: formData.title,
      description: formData.description || undefined,
      target_value: parseInt(formData.target_value),
      target_type: formData.target_type,
      target_period: formData.target_period,
      start_date: new Date().toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      target_value: '',
      target_type: 'hours',
      target_period: 'weekly',
      end_date: '',
    });
    setIsDialogOpen(false);
  };

  const getProgressPercentage = (goal: StudyGoal) => {
    return Math.min((goal.current_progress / goal.target_value) * 100, 100);
  };

  const getTargetTypeLabel = (type: string) => {
    const labels = {
      hours: 'hours',
      sessions: 'sessions',
      tasks: 'tasks completed'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly', 
      monthly: 'Monthly'
    };
    return labels[period as keyof typeof labels] || period;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Study Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Study Goals
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Study Goal</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Complete Math assignments"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about your goal..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_value">Target Value</Label>
                    <Input
                      id="target_value"
                      type="number"
                      min="1"
                      value={formData.target_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                      placeholder="10"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="target_type">Type</Label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value: 'hours' | 'sessions' | 'tasks') => 
                        setFormData(prev => ({ ...prev, target_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="sessions">Sessions</SelectItem>
                        <SelectItem value="tasks">Tasks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_period">Period</Label>
                    <Select
                      value={formData.target_period}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setFormData(prev => ({ ...prev, target_period: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Goal
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">No study goals set yet</p>
            <p className="text-sm">Create your first goal to track your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      {goal.completed && (
                        <Badge variant="secondary" className="text-xs bg-success/20 text-success border-success/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {getPeriodLabel(goal.target_period)}
                      </Badge>
                    </div>
                    
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Started {format(new Date(goal.start_date), 'MMM d')}
                      </span>
                      {goal.end_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ends {format(new Date(goal.end_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {goal.current_progress} / {goal.target_value} {getTargetTypeLabel(goal.target_type)}
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(goal)} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {getProgressPercentage(goal).toFixed(0)}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}