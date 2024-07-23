import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import { AuthProvider } from './components/ContextApi/AuthContext';
import { GlobalProvider  } from './components/ContextApi/GlobalContext';
import { TagProvider } from './components/ContextApi/TagContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalProvider >
      <TagProvider>
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </TagProvider>
    </GlobalProvider >
  </React.StrictMode>
);
