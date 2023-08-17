import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Redirect from './components/Redirect';
import './global.css';
import './i18n';
import App from './pages';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Redirect>
      <App />
    </Redirect>
  </React.StrictMode>
);
