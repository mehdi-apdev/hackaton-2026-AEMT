import api from '../../../services/api';
import type { Folder } from '../models/Folder';

/**
 * Service gérant uniquement la structure des dossiers.
 */
const FolderService = {
  /**
   * Récupère l'arborescence complète (Dossiers + Enfants + Notes).
   * GET /folders/tree
   */
  getTree: async (): Promise<Folder[]> => {
    const response = await api.get<Folder[]>('/folders/tree');
    return response.data;
  },

  /**
   * Crée un nouveau dossier.
   * POST /folders
   */
  createFolder: async (name: string, parentId: number | null = null): Promise<Folder> => {
    const response = await api.post<Folder>('/folders', { name, parentId });
    return response.data;
  },

  /**
   * Supprime un dossier et tout ce qu'il contient.
   * DELETE /folders/{id}
   */
  deleteFolder: async (id: number): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  /**
   * Renomme un dossier.
   * PUT /folders/{id}
   */
  renameFolder: async (id: number, name: string): Promise<Folder> => {
    const response = await api.put<Folder>(`/folders/${id}`, { name });
    return response.data;
  },
};

export default FolderService;
