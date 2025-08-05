import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay, addDays, addWeeks, addMonths } from "date-fns";

interface RecurringGoal {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetValue: number;
  currentProgress: number;
  unit: string;
  color: string;
  createdAt: Date;
  completedDates: Date[];
}

export const StudyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [recurringGoals, setRecurringGoals] = useState<RecurringGoal[]>([
    {
      id: '1',
      title: 'Daily Reading',
      description: 'Read academic materials',
      frequency: 'daily',
      targetValue: 30,
      currentProgress: 0,
      unit: 'minutes',
      color: 'bg-blue-500',
      createdAt: new Date(),
      completedDates: []
    },
    {
      id: '2',
      title: 'Weekly Review',
      description: 'Review notes and materials',
      frequency: 'weekly',
      targetValue: 2,
      currentProgress: 0,
      unit: 'hours',
      color: 'bg-green-500',
      createdAt: new Date(),
      completedDates: []
    }
  ]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    targetValue: number;
    unit: string;
  }>({
    title: '',
    description: '',
    frequency: 'daily',
    targetValue: 1,
    unit: 'minutes'
  });

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  const addRecurringGoal = () => {
    const goal: RecurringGoal = {
      id: Date.now().toString(),
      ...newGoal,
      currentProgress: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date(),
      completedDates: []
    };
    
    setRecurringGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      frequency: 'daily',
      targetValue: 1,
      unit: 'minutes'
    });
    setShowAddGoal(false);
  };

  const markGoalComplete = (goalId: string, date: Date) => {
    setRecurringGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const isAlreadyCompleted = goal.completedDates.some(d => isSameDay(d, date));
        if (isAlreadyCompleted) {
          return {
            ...goal,
            completedDates: goal.completedDates.filter(d => !isSameDay(d, date))
          };
        } else {
          return {
            ...goal,
            completedDates: [...goal.completedDates, date]
          };
        }
      }
      return goal;
    }));
  };

  const getGoalsForDate = (date: Date) => {
    return recurringGoals.filter(goal => {
      const daysSinceCreation = Math.floor((date.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (goal.frequency) {
        case 'daily':
          return daysSinceCreation >= 0;
        case 'weekly':
          return daysSinceCreation >= 0 && daysSinceCreation % 7 === 0;
        case 'monthly':
          return daysSinceCreation >= 0 && date.getDate() === goal.createdAt.getDate();
        default:
          return false;
      }
    });
  };

  const isGoalCompletedOnDate = (goal: RecurringGoal, date: Date) => {
    return goal.completedDates.some(d => isSameDay(d, date));
  };

  const selectedDateGoals = selectedDate ? getGoalsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Study Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            modifiers={{
              hasGoals: (date) => getGoalsForDate(date).length > 0,
              completed: (date) => {
                const goals = getGoalsForDate(date);
                return goals.length > 0 && goals.every(goal => isGoalCompletedOnDate(goal, date));
              },
              partial: (date) => {
                const goals = getGoalsForDate(date);
                const completed = goals.filter(goal => isGoalCompletedOnDate(goal, date));
                return goals.length > 0 && completed.length > 0 && completed.length < goals.length;
              }
            }}
            modifiersStyles={{
              hasGoals: { 
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                border: '1px solid hsl(var(--primary) / 0.3)'
              },
              completed: { 
                backgroundColor: 'hsl(var(--success))',
                color: 'hsl(var(--success-foreground))'
              },
              partial: { 
                backgroundColor: 'hsl(var(--warning))',
                color: 'hsl(var(--warning-foreground))'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Goals for Selected Date */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
          </CardTitle>
          <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Study Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Daily Reading"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Read academic materials"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={newGoal.frequency} 
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setNewGoal(prev => ({ ...prev, frequency: value }))
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
                    <Label htmlFor="unit">Unit</Label>
                    <Select 
                      value={newGoal.unit} 
                      onValueChange={(value) => setNewGoal(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="pages">Pages</SelectItem>
                        <SelectItem value="exercises">Exercises</SelectItem>
                        <SelectItem value="sessions">Sessions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                    min="1"
                  />
                </div>
                <Button onClick={addRecurringGoal} className="w-full" disabled={!newGoal.title}>
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {selectedDateGoals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recurring goals for this date
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateGoals.map(goal => {
                const isCompleted = isGoalCompletedOnDate(goal, selectedDate!);
                return (
                  <div 
                    key={goal.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all cursor-pointer",
                      isCompleted 
                        ? "bg-success/10 border-success/30" 
                        : "bg-card border-border hover:border-primary/30"
                    )}
                    onClick={() => markGoalComplete(goal.id, selectedDate!)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", goal.color)} />
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? "default" : "secondary"}>
                          {goal.targetValue} {goal.unit}
                        </Badge>
                        <Badge variant={goal.frequency === 'daily' ? 'default' : goal.frequency === 'weekly' ? 'secondary' : 'outline'}>
                          {goal.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};