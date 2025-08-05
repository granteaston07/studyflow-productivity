import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Repeat, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay, getDay, getDate } from "date-fns";
import { useStudyGoals, StudyGoal } from "@/hooks/useStudyGoals";
import { EditStudyGoalDialog } from "@/components/EditStudyGoalDialog";
import { useToast } from "@/hooks/use-toast";

export const StudyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { goals, loading, addGoal, updateGoal, deleteGoal, toggleGoalCompletion } = useStudyGoals();
  const { toast } = useToast();
  
  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    target_value: number;
    unit: string;
    specific_date?: Date;
    week_day?: number;
    month_date?: number;
  }>({
    title: '',
    description: '',
    frequency: 'daily',
    target_value: 30,
    unit: 'minutes',
    specific_date: undefined,
    week_day: undefined,
    month_date: undefined
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

  const addStudyGoal = async () => {
    if (!newGoal.title) return;
    
    // Validation for frequency-specific requirements
    if (newGoal.frequency === 'once' && !newGoal.specific_date) {
      toast({
        title: "Missing Information",
        description: "Please select a date for the one-time goal",
        variant: "destructive",
      });
      return;
    }
    
    if (newGoal.frequency === 'weekly' && newGoal.week_day === undefined) {
      toast({
        title: "Missing Information", 
        description: "Please select a day of the week",
        variant: "destructive",
      });
      return;
    }
    
    if (newGoal.frequency === 'monthly' && !newGoal.month_date) {
      toast({
        title: "Missing Information",
        description: "Please select a date of the month", 
        variant: "destructive",
      });
      return;
    }

    try {
      await addGoal({
        title: newGoal.title,
        description: newGoal.description,
        frequency: newGoal.frequency === 'weekly' ? 'weekly_same_day' : 
                   newGoal.frequency === 'monthly' ? 'monthly_same_date' : newGoal.frequency,
        target_value: newGoal.target_value,
        unit: newGoal.unit,
        color: colors[Math.floor(Math.random() * colors.length)],
        week_day: newGoal.frequency === 'weekly' ? newGoal.week_day : null,
        month_date: newGoal.frequency === 'monthly' ? newGoal.month_date : null,
        repeat_interval: 1,
        repeat_end_date: null,
        repeat_count: null
      });
      
      setNewGoal({
        title: '',
        description: '',
        frequency: 'daily',
        target_value: 30,
        unit: 'minutes',
        specific_date: undefined,
        week_day: undefined,
        month_date: undefined
      });
      setShowAddGoal(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleEditGoal = (goal: StudyGoal) => {
    setEditingGoal(goal);
    setShowEditDialog(true);
  };

  const handleGoalUpdate = async (id: string, updates: Partial<StudyGoal>) => {
    await updateGoal(id, updates);
  };

  const handleGoalClick = async (goalId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    await toggleGoalCompletion(goalId, dateString);
  };

  const getGoalsForDate = (date: Date) => {
    return goals.filter(goal => {
      const goalCreatedAt = new Date(goal.created_at);
      if (date < goalCreatedAt) return false;

      switch (goal.frequency) {
        case 'once':
          return isSameDay(date, goalCreatedAt);
        case 'daily':
          return true;
        case 'weekly_same_day':
          return goal.week_day !== null && getDay(date) === goal.week_day;
        case 'monthly_same_date':
          return goal.month_date !== null && getDate(date) === goal.month_date;
        default:
          return false;
      }
    });
  };

  const isGoalCompletedOnDate = (goal: StudyGoal, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return goal.completed_dates.includes(dateString);
  };

  const getFrequencyLabel = (goal: StudyGoal) => {
    switch (goal.frequency) {
      case 'once':
        return 'Once';
      case 'daily':
        return 'Daily';
      case 'weekly_same_day':
        return `Weekly (${weekDays[goal.week_day || 0]})`;
      case 'monthly_same_date':
        return `Monthly (${goal.month_date}${getOrdinalSuffix(goal.month_date || 1)})`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading study goals...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar */}
      <Card className="lg:w-fit lg:flex-shrink-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
      <Card className="flex-1">
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
                <DialogTitle>Add Study Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Practice Math"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Solve algebra problems"
                  />
                </div>
                
                <div>
                  <Label htmlFor="frequency">How often?</Label>
                  <Select 
                    value={newGoal.frequency} 
                    onValueChange={(value: 'once' | 'daily' | 'weekly' | 'monthly') => {
                      setNewGoal(prev => ({ 
                        ...prev, 
                        frequency: value,
                        specific_date: undefined,
                        week_day: undefined,
                        month_date: undefined
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Just once</SelectItem>
                      <SelectItem value="daily">Every day</SelectItem>
                      <SelectItem value="weekly">Every week (same day)</SelectItem>
                      <SelectItem value="monthly">Every month (same date)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newGoal.frequency === 'once' && (
                  <div>
                    <Label>When?</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newGoal.specific_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newGoal.specific_date ? format(newGoal.specific_date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newGoal.specific_date}
                          onSelect={(date) => setNewGoal(prev => ({ ...prev, specific_date: date }))}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {newGoal.frequency === 'weekly' && (
                  <div>
                    <Label htmlFor="weekDay">Which day of the week?</Label>
                    <Select 
                      value={newGoal.week_day?.toString() || ''} 
                      onValueChange={(value) => setNewGoal(prev => ({ ...prev, week_day: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newGoal.frequency === 'monthly' && (
                  <div>
                    <Label htmlFor="monthDate">Which date of the month?</Label>
                    <Input
                      id="monthDate"
                      type="number"
                      min="1"
                      max="31"
                      value={newGoal.month_date || ''}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, month_date: parseInt(e.target.value) || undefined }))}
                      placeholder="e.g., 15"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="target">Target</Label>
                  <div className="flex gap-2">
                    <Input
                      id="target"
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) || 30 }))}
                      min="1"
                      className="flex-1"
                    />
                    <Select 
                      value={newGoal.unit} 
                      onValueChange={(value) => setNewGoal(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="pages">Pages</SelectItem>
                        <SelectItem value="problems">Problems</SelectItem>
                        <SelectItem value="exercises">Exercises</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={addStudyGoal} className="w-full" disabled={!newGoal.title}>
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No study goals yet.</p>
              <p className="text-sm mt-2">Add your first study goal to get started!</p>
            </div>
          ) : selectedDateGoals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No study goals for this date
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
                    onClick={() => handleGoalClick(goal.id, selectedDate!)}
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
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
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
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? "default" : "secondary"}>
                          {goal.target_value} {goal.unit}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getFrequencyLabel(goal)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isCompleted ? 'Completed ✓' : 'Click to complete'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <EditStudyGoalDialog
        goal={editingGoal}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleGoalUpdate}
      />
    </div>
  );
};