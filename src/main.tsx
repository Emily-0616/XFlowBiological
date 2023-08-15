import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';
import App from './pages/index';
// import i18n (needs to be bundled ;))
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
