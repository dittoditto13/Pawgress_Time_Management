import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { BuddyProvider } from './context/BuddyContext.jsx';

// HashRouter (URLs like /#/login) so routing also works when Electron loads the built
// app from a file:// URL, where BrowserRouter's history paths would 404.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <BuddyProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </BuddyProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
