import type { Folder } from './models/Folder';

/**
 * Données de test pour le développement Frontend.
 * Respecte strictement les interfaces Folder.ts et Note.ts.
 */
export const MOCK_FOLDERS: Folder[] = [
  {
    id: 1,
    name: "Histoires d'horreur",
    parentId: null,
    children: [
      {
        id: 2,
        name: "Chapitre 1 : Le Cimetière",
        parentId: 1,
        children: [
          {
             id: 3,
             name: "Brouillons abandonnés",
             parentId: 2,
             children: [], 
             notes: []
          }
        ],
        notes: [
            { 
                id: 102, 
                title: "Intro effrayante", 
                folderId: 2, // Lien explicite vers le parent
                createdAt: "2023-10-31T23:00:00", // Format ISO requis
                content: "# Introduction\nIl faisait nuit noire..." 
            }
        ]
      },
      {
          id: 4,
          name: "Personnages",
          parentId: 1,
          children: [],
          notes: [
              { 
                  id: 103, 
                  title: "Dracula", 
                  folderId: 4,
                  createdAt: "2023-10-31T10:30:00"
              },
              { 
                  id: 104, 
                  title: "Van Helsing", 
                  folderId: 4,
                  createdAt: "2023-10-31T11:00:00"
              }
          ]
      }
    ],
    notes: [
        { 
            id: 101, 
            title: "Idée de Vampire", 
            folderId: 1,
            createdAt: "2023-10-31T09:15:00"
        }
    ]
  },
  {
      id: 5,
      name: "Liste de courses Halloween",
      parentId: null,
      children: [],
      notes: [
          { 
              id: 105, 
              title: "Acheter des citrouilles", 
              folderId: 5,
              createdAt: "2023-10-28T14:20:00",
              content: "- [ ] Citrouille\n- [ ] Bougies\n- [ ] Faux sang"
          }
      ]
  }
];