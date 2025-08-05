import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Repeat, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay, getDay, getDate } from "date-fns";

interface RecurringGoal {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly_same_day' | 'monthly_same_date';
  targetValue: number;
  currentProgress: number;
  unit: string;
  color: string;
  createdAt: Date;
  completedDates: Date[];
  weekDay?: number; // 0-6 for weekly_same_day (Sunday = 0)
  monthDate?: number; // 1-31 for monthly_same_date
}

export const StudyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [recurringGoals, setRecurringGoals] = useState<RecurringGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    frequency: 'daily' | 'weekly_same_day' | 'monthly_same_date';
    targetValue: number;
    unit: string;
    weekDay?: number;
    monthDate?: number;
  }>({
    title: '',
    description: '',
    frequency: 'daily',
    targetValue: 1,
    unit: 'minutes',
    weekDay: undefined,
    monthDate: undefined
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

  const weekDays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const addRecurringGoal = () => {
    if (!newGoal.title) return;

    const goal: RecurringGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      frequency: newGoal.frequency,
      targetValue: newGoal.targetValue,
      unit: newGoal.unit,
      currentProgress: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date(),
      completedDates: [],
      weekDay: newGoal.weekDay,
      monthDate: newGoal.monthDate
    };
    
    setRecurringGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      frequency: 'daily',
      targetValue: 1,
      unit: 'minutes',
      weekDay: undefined,
      monthDate: undefined
    });
    setShowAddGoal(false);
  };

  const deleteGoal = (goalId: string) => {
    setRecurringGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const clearAllGoals = () => {
    setRecurringGoals([]);
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
      if (date < goal.createdAt) return false;

      switch (goal.frequency) {
        case 'daily':
          return true;
        case 'weekly_same_day':
          return goal.weekDay !== undefined && getDay(date) === goal.weekDay;
        case 'monthly_same_date':
          return goal.monthDate !== undefined && getDate(date) === goal.monthDate;
        default:
          return false;
      }
    });
  };

  const isGoalCompletedOnDate = (goal: RecurringGoal, date: Date) => {
    return goal.completedDates.some(d => isSameDay(d, date));
  };

  const getFrequencyLabel = (goal: RecurringGoal) => {
    switch (goal.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly_same_day':
        return `Every ${weekDays[goal.weekDay || 0]}`;
      case 'monthly_same_date':
        return `${goal.monthDate}${getOrdinalSuffix(goal.monthDate || 1)} of month`;
      default:
        return goal.frequency;
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const selectedDateGoals = selectedDate ? getGoalsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Study Calendar
          </CardTitle>
          {recurringGoals.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Goals</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all recurring study goals and their completion history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllGoals} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear All Goals
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
            <DialogContent className="max-w-md">
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
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select 
                    value={newGoal.frequency} 
                    onValueChange={(value: 'daily' | 'weekly_same_day' | 'monthly_same_date') => {
                      setNewGoal(prev => ({ 
                        ...prev, 
                        frequency: value,
                        weekDay: value === 'weekly_same_day' ? 0 : undefined,
                        monthDate: value === 'monthly_same_date' ? 1 : undefined
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly_same_day">Same day of week</SelectItem>
                      <SelectItem value="monthly_same_date">Same date of month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newGoal.frequency === 'weekly_same_day' && (
                  <div>
                    <Label htmlFor="weekDay">Day of Week</Label>
                    <Select 
                      value={newGoal.weekDay?.toString() || '0'} 
                      onValueChange={(value) => setNewGoal(prev => ({ ...prev, weekDay: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newGoal.frequency === 'monthly_same_date' && (
                  <div>
                    <Label htmlFor="monthDate">Date of Month</Label>
                    <Input
                      id="monthDate"
                      type="number"
                      min="1"
                      max="31"
                      value={newGoal.monthDate || 1}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, monthDate: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                <Button onClick={addRecurringGoal} className="w-full" disabled={!newGoal.title}>
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {recurringGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recurring goals yet.</p>
              <p className="text-sm mt-2">Add your first recurring study goal to get started!</p>
            </div>
          ) : selectedDateGoals.length === 0 ? (
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
                      "p-4 rounded-lg border transition-all",
                      isCompleted 
                        ? "bg-success/10 border-success/30" 
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", goal.color)} />
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{goal.title}" and all its completion history. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGoal(goal.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete Goal
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? "default" : "secondary"}>
                          {goal.targetValue} {goal.unit}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getFrequencyLabel(goal)}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant={isCompleted ? "default" : "outline"}
                        onClick={() => markGoalComplete(goal.id, selectedDate!)}
                        className="ml-2"
                      >
                        {isCompleted ? 'Completed' : 'Mark Complete'}
                      </Button>
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