import api from '../../../services/api';
import type { Note } from '../models/Note';

/**
 * Service gérant le contenu et les actions sur les notes.
 */
const NoteService = {
  /**
   * Récupère le contenu détaillé d'une note.
   * GET /notes/{id}
   */
  getNoteById: async (id: number): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle note vide dans un dossier.
   * POST /notes
   */
  createNote: async (title: string, folderId: number): Promise<Note> => {
    const response = await api.post<Note>('/notes', { title, folderId });
    return response.data;
  },

  /**
   * Sauvegarde le titre ou le contenu Markdown.
   * PUT /notes/{id}
   */
  updateNote: async (id: number, title: string, content: string): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${id}`, { title, content });
    return response.data;
  },

  /**
   * Supprime une note.
   * DELETE /notes/{id}
   */
  deleteNote: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}`);
  }
};

export default NoteService;