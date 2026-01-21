import api from '../../../services/api';
import type { Folder } from '../models/Folder';

/**
 * Service managing only the folder structure.
 */
const FolderService = {
  /**
   * Retrieves the full tree (Folders + Children + Notes).
   * GET /folders/tree
   */
  getTree: async (): Promise<Folder[]> => {
    const response = await api.get<Folder[]>('/folders/tree');
    return response.data;
  },

 /**
   * Creates a new folder.
   * POST /folders
   */
  createFolder: async (name: string, parentId: number | null = null): Promise<Folder> => {
    const response = await api.post<Folder>('/folders', { name, parentId });
    return response.data;
  },

 /**
   * Deletes a folder and all its contents.
   * DELETE /folders/{id}
   */
  deleteFolder: async (id: number): Promise<void> => {
    await api.delete(`/folders/${id}`);
  }
};

export default FolderService;