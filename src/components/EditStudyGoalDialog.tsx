import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudyGoal } from "@/hooks/useStudyGoals";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditStudyGoalDialogProps {
  goal: StudyGoal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<StudyGoal>) => Promise<void>;
}

const weekDays = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const EditStudyGoalDialog = ({ goal, open, onOpenChange, onSave }: EditStudyGoalDialogProps) => {
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'once' | 'daily' | 'weekly_same_day' | 'monthly_same_date',
    target_value: 1,
    unit: 'minutes',
    week_day: 0,
    month_date: 1,
    repeat_interval: 1,
    repeat_end_date: null as Date | null,
    repeat_count: null as number | null
  });

  useEffect(() => {
    if (goal) {
      setEditData({
        title: goal.title,
        description: goal.description || '',
        frequency: goal.frequency as 'once' | 'daily' | 'weekly_same_day' | 'monthly_same_date',
        target_value: goal.target_value,
        unit: goal.unit,
        week_day: goal.week_day || 0,
        month_date: goal.month_date || 1,
        repeat_interval: goal.repeat_interval,
        repeat_end_date: goal.repeat_end_date ? new Date(goal.repeat_end_date) : null,
        repeat_count: goal.repeat_count || null
      });
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal || !editData.title) return;

    const updates: Partial<StudyGoal> = {
      title: editData.title,
      description: editData.description,
      frequency: editData.frequency,
      target_value: editData.target_value,
      unit: editData.unit,
      repeat_interval: editData.repeat_interval,
      week_day: editData.frequency === 'weekly_same_day' ? editData.week_day : null,
      month_date: editData.frequency === 'monthly_same_date' ? editData.month_date : null,
      repeat_end_date: editData.repeat_end_date ? editData.repeat_end_date.toISOString() : null,
      repeat_count: editData.repeat_count
    };

    await onSave(goal.id, updates);
    onOpenChange(false);
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Study Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Daily Reading"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Input
              id="edit-description"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Read academic materials"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-frequency">Frequency</Label>
            <Select 
              value={editData.frequency} 
              onValueChange={(value: 'once' | 'daily' | 'weekly_same_day' | 'monthly_same_date') => {
                setEditData(prev => ({ 
                  ...prev, 
                  frequency: value,
                  week_day: value === 'weekly_same_day' ? 0 : prev.week_day,
                  month_date: value === 'monthly_same_date' ? 1 : prev.month_date
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly_same_day">Same day of week</SelectItem>
                <SelectItem value="monthly_same_date">Same date of month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editData.frequency === 'weekly_same_day' && (
            <div>
              <Label htmlFor="edit-weekDay">Day of Week</Label>
              <Select 
                value={editData.week_day.toString()} 
                onValueChange={(value) => setEditData(prev => ({ ...prev, week_day: parseInt(value) }))}
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

          {editData.frequency === 'monthly_same_date' && (
            <div>
              <Label htmlFor="edit-monthDate">Date of Month</Label>
              <Input
                id="edit-monthDate"
                type="number"
                min="1"
                max="31"
                value={editData.month_date}
                onChange={(e) => setEditData(prev => ({ ...prev, month_date: parseInt(e.target.value) || 1 }))}
              />
            </div>
          )}

          {editData.frequency !== 'once' && (
            <div>
              <Label>End Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editData.repeat_end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editData.repeat_end_date ? format(editData.repeat_end_date, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.repeat_end_date || undefined}
                    onSelect={(date) => setEditData(prev => ({ 
                      ...prev, 
                      repeat_end_date: date || null
                    }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {editData.repeat_end_date && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditData(prev => ({ ...prev, repeat_end_date: null }))}
                  className="mt-2"
                >
                  Clear End Date
                </Button>
              )}
            </div>
          )}

            <div>
              <Label htmlFor="edit-targetValue">Target</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-targetValue"
                  type="number"
                  value={editData.target_value}
                  onChange={(e) => setEditData(prev => ({ ...prev, target_value: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="flex-1"
                />
                <Select 
                  value={editData.unit} 
                  onValueChange={(value) => setEditData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className="w-32">
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
          
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={!editData.title}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};