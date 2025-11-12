import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCustomSubjects } from '@/hooks/useCustomSubjects';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

export function SubjectNameEditor() {
  const { allSubjects, getDisplayName, updateDisplayName } = useCustomSubjects();
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');

  const handleSave = async (actualName: string) => {
    if (!newDisplayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    const success = await updateDisplayName(actualName, newDisplayName.trim());
    if (success) {
      toast.success('Subject display name updated');
      setEditingSubject(null);
      setNewDisplayName('');
    } else {
      toast.error('Failed to update display name');
    }
  };

  const startEditing = (subject: string) => {
    setEditingSubject(subject);
    setNewDisplayName(getDisplayName(subject));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-2" />
          Edit Subject Names
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Subject Display Names</SheetTitle>
          <SheetDescription>
            Change how subjects appear without affecting saved data
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          {allSubjects.map((subject) => (
            <div key={subject} className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Database: {subject}
              </Label>
              {editingSubject === subject ? (
                <div className="flex gap-2">
                  <Input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Display name"
                  />
                  <Button onClick={() => handleSave(subject)} size="sm">
                    Save
                  </Button>
                  <Button 
                    onClick={() => {
                      setEditingSubject(null);
                      setNewDisplayName('');
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <span className="font-medium">{getDisplayName(subject)}</span>
                  <Button 
                    onClick={() => startEditing(subject)} 
                    variant="ghost" 
                    size="sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
