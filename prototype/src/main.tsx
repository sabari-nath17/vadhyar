import { createRoot } from 'react-dom/client';
import { WorkspaceApp } from './Workspace.js';
import './style.css';
import './project-style.css';
createRoot(document.getElementById('root')!).render(<WorkspaceApp />);
