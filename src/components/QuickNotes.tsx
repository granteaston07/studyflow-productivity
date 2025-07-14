import { useState } from "react";
import { NotebookPen, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

export function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: new Date()
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote("");
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  return (
    <Card className="h-64">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <NotebookPen className="h-4 w-4 text-primary" />
          Quick Notes
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2 h-48 flex flex-col">
        {/* Add Note */}
        <div className="space-y-2 flex-shrink-0">
          <Textarea
            placeholder="Jot down a quick note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="resize-none h-12 text-xs"
          />
          <Button 
            onClick={addNote} 
            size="sm" 
            className="w-full h-7 text-xs"
            disabled={!newNote.trim()}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-1 flex-1 overflow-y-auto min-h-0">
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No notes yet. Add your first note above!
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="group p-2 rounded-md bg-background/50 border border-border/50 relative flex-shrink-0"
              >
                <p className="text-xs text-foreground pr-6 line-clamp-2">{note.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-1 right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}