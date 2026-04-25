import { useState } from "react";
import { Settings, Plus, Trash2, Check, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCustomLinks, StudyLink } from "@/hooks/useCustomLinks";
import { ICON_MAP, ICON_OPTIONS } from "@/lib/linkIcons";

export function StudyLinks() {
  const { links, updateLink, addLink, deleteLink, resetToDefault } = useCustomLinks();
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);

  const startEdit = (id: string) => {
    setEditingId(id);
    setIconPickerFor(null);
  };

  const handleAddLink = () => {
    const newId = addLink();
    setEditingId(newId);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {links.map(({ id, name, url, icon }) => {
            const Icon = ICON_MAP[icon] ?? ICON_MAP["Globe"];
            return (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all duration-150 group"
              >
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors line-clamp-1">
                  {name}
                </span>
              </a>
            );
          })}
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="mx-auto flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-150"
          title="Customize links"
        >
          <Settings className="h-2.5 w-2.5" />
          edit
        </button>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Links
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-2 pb-4">
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                isEditing={editingId === link.id}
                iconPickerOpen={iconPickerFor === link.id}
                onEdit={() => startEdit(link.id)}
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
                onDelete={() => { deleteLink(link.id); setEditingId(null); }}
                onUpdate={(updates) => updateLink(link.id, updates)}
                onToggleIconPicker={() => setIconPickerFor(prev => prev === link.id ? null : link.id)}
              />
            ))}

            <button
              onClick={handleAddLink}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border active:bg-muted/40 transition-colors duration-150 min-h-[44px]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add link
            </button>

            <button
              onClick={() => { resetToDefault(); setEditingId(null); }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to defaults
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface LinkRowProps {
  link: StudyLink;
  isEditing: boolean;
  iconPickerOpen: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<StudyLink>) => void;
  onToggleIconPicker: () => void;
}

function LinkRow({ link, isEditing, iconPickerOpen, onEdit, onSave, onCancel, onDelete, onUpdate, onToggleIconPicker }: LinkRowProps) {
  const Icon = ICON_MAP[link.icon] ?? ICON_MAP["Globe"];

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{link.name}</p>
          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
        </div>
        <button
          onClick={onEdit}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 active:bg-muted/80 transition-colors flex-shrink-0"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/4 overflow-hidden">
      <div className="p-3 space-y-2.5">
        {/* Icon + Name row */}
        <div className="flex gap-2">
          <button
            onClick={onToggleIconPicker}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 bg-background hover:bg-muted/60 transition-colors flex-shrink-0"
            title="Change icon"
          >
            <Icon className="h-4 w-4 text-foreground" />
          </button>
          <Input
            value={link.name}
            onChange={e => onUpdate({ name: e.target.value })}
            placeholder="Link name"
            className="h-9 text-sm flex-1"
          />
        </div>

        {/* Icon picker */}
        {iconPickerOpen && (
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-2 rounded-lg bg-background border border-border/50">
            {ICON_OPTIONS.map(({ key, Icon: Ic, label }) => (
              <button
                key={key}
                onClick={() => { onUpdate({ icon: key }); onToggleIconPicker(); }}
                title={label}
                className={`w-full aspect-square min-h-[40px] flex items-center justify-center rounded-lg transition-colors ${
                  link.icon === key ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 active:bg-muted/80'
                }`}
              >
                <Ic className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}

        {/* URL row */}
        <Input
          value={link.url}
          onChange={e => onUpdate({ url: e.target.value })}
          placeholder="https://..."
          className="h-9 text-sm"
        />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <Button size="sm" className="h-7 px-3 text-xs gap-1.5" onClick={onSave}>
            <Check className="h-3 w-3" /> Save
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-3 text-xs text-muted-foreground" onClick={onCancel}>
            <X className="h-3 w-3" /> Cancel
          </Button>
          <button
            onClick={onDelete}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
