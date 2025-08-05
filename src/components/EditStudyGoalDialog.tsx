import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudyGoal } from "@/hooks/useStudyGoals";

interface EditStudyGoalDialogProps {
  goal: StudyGoal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<StudyGoal>) => Promise<void>;
}

export const EditStudyGoalDialog = ({ goal, open, onOpenChange, onSave }: EditStudyGoalDialogProps) => {
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'once' | 'daily' | 'weekly' | 'monthly',
    target_value: 30,
    unit: 'minutes'
  });

  useEffect(() => {
    if (goal) {
      // Convert database frequency back to simple format
      const simpleFreq = goal.frequency === 'weekly_same_day' ? 'weekly' :
                        goal.frequency === 'monthly_same_date' ? 'monthly' : 
                        goal.frequency as 'once' | 'daily' | 'weekly' | 'monthly';
      
      setEditData({
        title: goal.title,
        description: goal.description || '',
        frequency: simpleFreq,
        target_value: goal.target_value,
        unit: goal.unit
      });
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal || !editData.title) return;

    const today = new Date();
    const currentDay = today.getDay();
    const currentDate = today.getDate();

    const updates: Partial<StudyGoal> = {
      title: editData.title,
      description: editData.description,
      frequency: editData.frequency === 'weekly' ? 'weekly_same_day' :
                editData.frequency === 'monthly' ? 'monthly_same_date' : editData.frequency,
      target_value: editData.target_value,
      unit: editData.unit,
      week_day: editData.frequency === 'weekly' ? currentDay : null,
      month_date: editData.frequency === 'monthly' ? currentDate : null
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
            <Label htmlFor="edit-title">Goal Title</Label>
            <Input
              id="edit-title"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Practice Math"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Input
              id="edit-description"
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Solve algebra problems"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-frequency">How often?</Label>
            <Select 
              value={editData.frequency} 
              onValueChange={(value: 'once' | 'daily' | 'weekly' | 'monthly') => {
                setEditData(prev => ({ ...prev, frequency: value }));
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

          <div>
            <Label htmlFor="edit-target">Target</Label>
            <div className="flex gap-2">
              <Input
                id="edit-target"
                type="number"
                value={editData.target_value}
                onChange={(e) => setEditData(prev => ({ ...prev, target_value: parseInt(e.target.value) || 30 }))}
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
                  <SelectItem value="problems">Problems</SelectItem>
                  <SelectItem value="exercises">Exercises</SelectItem>
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