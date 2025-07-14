import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Note {
  id: string;
  title?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedNotes: Note[] = data.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at)
      }));

      setNotes(formattedNotes);
    } catch (error: any) {
      toast.error('Failed to load notes');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const addNote = async (content: string, title?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          content
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        title: data.title,
        content: data.content,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      setNotes(prev => [newNote, ...prev]);
      toast.success('Note saved');
    } catch (error: any) {
      toast.error('Failed to save note');
      console.error('Error adding note:', error);
    }
  };

  const updateNote = async (noteId: string, content: string, title?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ content, title })
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, content, title, updatedAt: new Date() }
          : note
      ));
    } catch (error: any) {
      toast.error('Failed to update note');
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Note deleted');
    } catch (error: any) {
      toast.error('Failed to delete note');
      console.error('Error deleting note:', error);
    }
  };

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes: fetchNotes
  };
}