import api from '../../../services/api';
import type { Folder } from '../models/Folder';

/**
 * Service managing only the folder structure.
 * GET, POST, DELETE, PUT on /folders endpoint.
 */
const FolderService = {
  /**
   * Retrieves the full tree (Folders + Children + Notes).
   * GET /folders/tree
   * @return Full folder tree
   */
  getTree: async (): Promise<Folder[]> => {
    const response = await api.get<Folder[]>('/folders/tree');
    return response.data;
  },

 /**
   * Creates a new folder.
   * POST /folders
   * @param name Name of the new folder
   * @param parentId Optional parent folder ID
   */
  createFolder: async (name: string, parentId: number | null = null): Promise<Folder> => {
    const response = await api.post<Folder>('/folders', { name, parentId });
    return response.data;
  },

 /**
   * Deletes a folder and all its contents.
   * DELETE /folders/{id}
   * @param id Folder ID to delete
   */
  deleteFolder: async (id: number): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  /**
   * Rename a folder.
   * PUT /folders/{id}
   * @param id ID of the folder to rename
   * @param name New name of the folder
   */
  renameFolder: async (id: number, name: string): Promise<Folder> => {
    const response = await api.put<Folder>(`/folders/${id}`, { name });
    return response.data;
  },
};

export default FolderService;