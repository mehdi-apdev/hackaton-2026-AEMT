import api from '../../../services/api';
import type { Note } from '../models/Note';

/**
 * Service managing content and actions on notes.
 */
const NoteService = {
 /**
   * Retrieves the detailed content of a note.
   * GET /notes/{id}
   */
  getNoteById: async (id: number): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  /**
   * Creates a new empty note in a folder.
   * POST /notes
   */

 
/**
 * Service to manage note-related API calls.
 */

  // Creates a new note. If folderId is null, the backend logic handles it.
  createNote: async (title: string, content: string, folderId: number | null): Promise<Note> => {
      const response = await api.post<Note>('/notes', { 
          title, 
          content, 
          folderId: folderId ?? null 
      });
      return response.data;
  },
  // ...

  /**
   * Saves the title or Markdown content.
   * PUT /notes/{id}
   */
  updateNote: async (id: number, title: string, content: string): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${id}`, { title, content });
    return response.data;
  },

  /**
   * Deletes a note.
   * DELETE /notes/{id}
   */
  deleteNote: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
 
  /**
   * Exporte toutes les notes et dossiers en archive ZIP.
   * GET /notes/export/zip
   */
  exportArchive: async (): Promise<Blob> => {
    const response = await api.get<Blob>('/notes/export/zip', { responseType: 'blob' });
    return response.data;
  },
};

export default NoteService;