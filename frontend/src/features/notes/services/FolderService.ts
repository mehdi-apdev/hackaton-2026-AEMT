import api from '../../../services/api';
import type { Folder } from '../models/Folder';
import type { Note } from '../models/Note';

/**
 * Service gérant les appels API pour les dossiers et l'arborescence.
 * Utilise les endpoints définis pour le Palier Chauve-souris.
 */
const FolderService = {
  /**
   * Récupère toute l'arborescence (Dossiers + Enfants + Notes).
   * GET /folders/tree
   */
  getTree: async (): Promise<Folder[]> => {
    const response = await api.get<Folder[]>('/folders/tree');
    return response.data;
  },

  /**
   * Crée un nouveau dossier.
   * POST /folders
   * @param name Nom du dossier
   * @param parentId ID du dossier parent (optionnel)
   */
  createFolder: async (name: string, parentId: number | null = null): Promise<Folder> => {
    const response = await api.post<Folder>('/folders', { name, parentId });
    return response.data;
  },

  /**
   * Supprime un dossier et tout son contenu.
   * DELETE /folders/{id}
   */
  deleteFolder: async (id: number): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  /**
   * Crée une nouvelle note vide dans un dossier.
   * POST /notes
   * @param title Titre de la note
   * @param folderId ID du dossier de destination
   */
  createNote: async (title: string, folderId: number): Promise<Note> => {
    const response = await api.post<Note>('/notes', { title, folderId });
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

export default FolderService;