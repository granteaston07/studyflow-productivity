import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCustomSubjects } from "@/hooks/useCustomSubjects";
import { Task } from "@/hooks/useTasks";
import { toast } from "sonner";

interface SubjectManagerProps {
  tasks: Task[];
}

export function SubjectManager({ tasks }: SubjectManagerProps) {
  const {
    allSubjects, defaultSubjects, customSubjects,
    addCustomSubject, deleteCustomSubject, updateDisplayName, getDisplayName,
  } = useCustomSubjects();

  const [newSubject, setNewSubject] = useState("");
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const taskCountFor = (subject: string) =>
    tasks.filter(t => (t.subject || "General") === subject).length;

  const handleAdd = async () => {
    const trimmed = newSubject.trim();
    if (!trimmed) return;
    const ok = await addCustomSubject(trimmed);
    if (ok) { setNewSubject(""); toast.success("Subject added"); }
    else toast.error("Subject already exists");
  };

  const handleDelete = async (subject: string) => {
    await deleteCustomSubject(subject);
    toast.success("Subject removed");
  };

  const startEdit = (subject: string) => {
    setEditingSubject(subject);
    setEditValue(getDisplayName(subject));
  };

  const saveEdit = async (subject: string) => {
    if (!editValue.trim()) return;
    await updateDisplayName(subject, editValue.trim());
    setEditingSubject(null);
    toast.success("Display name updated");
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subjects</p>

      <div className="space-y-1.5">
        {allSubjects.map(subject => {
          const isCustom = customSubjects.includes(subject);
          const count = taskCountFor(subject);
          const isEditing = editingSubject === subject;

          return (
            <div key={subject} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/50">
              {isEditing ? (
                <>
                  <Input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(subject); if (e.key === "Escape") setEditingSubject(null); }}
                    className="h-7 text-sm flex-1"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(subject)} className="w-7 h-7 flex items-center justify-center rounded-lg text-success hover:bg-success/10 transition-colors">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEditingSubject(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-foreground">{getDisplayName(subject)}</span>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground">{count} task{count !== 1 ? "s" : ""}</span>
                  )}
                  <button onClick={() => startEdit(subject)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {isCustom && (
                    <button onClick={() => handleDelete(subject)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add custom subject */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a subject..."
          value={newSubject}
          onChange={e => setNewSubject(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="h-9 text-sm"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newSubject.trim()} className="h-9 px-3 gap-1">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
