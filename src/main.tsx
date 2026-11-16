import React from 'react';
import ReactDOM from 'react-dom/client';
import 'glisse/styles.css';
import './styles/styles.css';
import App from './App';
import { applyTheme, getInitialTheme } from './utils/theme';

applyTheme(getInitialTheme(), false);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
