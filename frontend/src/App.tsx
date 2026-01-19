import { MOCK_FOLDERS } from './features/notes/mockData';
import { FolderTree } from './features/notes/components/FolderTree';

function App() {
  return (
    <div style={{ backgroundColor: '#111', height: '100vh', padding: '20px', color: 'white' }}>
      <h2>🎃 Test Navigation - Mehdi</h2>
      
      <div style={{ width: '300px', border: '1px solid #333', padding: '10px' }}>
        {MOCK_FOLDERS.map((folder) => (
          <FolderTree key={folder.id} folder={folder} />
        ))}
      </div>
    
    </div>
  );
}

export default App;