import api from '../../../services/api';
import type { Note } from '../models/Note';
import type { Folder } from '../models/Folder';

const BinService = {
  
  // --- NOTES ---
  /**
   * Retrieves deleted notes.
   * GET /corbeille
   * @return Array of deleted notes
   */
  getDeletedNotes: async (): Promise<Note[]> => {
    const response = await api.get<Note[]>('/corbeille');
    return response.data;
  },

  /**
   * Restores a deleted note.
   * POST /corbeille/notes/{id}/restore
   * @param id Note ID to restore
   */
  restoreNote: async (id: number): Promise<void> => {
    await api.post(`/corbeille/notes/${id}/restore`);
  },

  // -- FOLDERS --
  /**
   * Permanently deletes a note from the bin.
   * DELETE /corbeille/notes/{id}
   * @param id Note ID to delete
   */
  permanentDeleteNote: async (id: number): Promise<void> => {
    await api.delete(`/corbeille/notes/${id}`);
  },

  /**
   * Retrieves deleted folders.
   * GET /corbeille/folders
   * Also, it includes their notes and children folders.
   * @return Array of deleted folders
   */
  getDeletedFolders: async (): Promise<Folder[]> => {
    const response = await api.get<Folder[]>('/corbeille/folders');
    return response.data;
  },

  /**
   * Restores a deleted folder along with its contents.
   * POST /corbeille/folders/{id}/restore
   * @param id Folder ID to restore
   */
  restoreFolder: async (id: number): Promise<void> => {
    await api.post(`/corbeille/folders/${id}/restore`);
  },

  /**
   * Permanently deletes a folder and all its contents from the bin.
   * DELETE /corbeille/folders/{id}
   * @param id Folder ID to delete
   */
  permanentDeleteFolder: async (id: number): Promise<void> => {
    await api.delete(`/corbeille/folders/${id}`);
  },
};

export default BinService;
