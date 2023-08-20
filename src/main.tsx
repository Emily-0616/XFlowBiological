import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Redirect from './components/Redirect';
import './global.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Redirect>
      <App />
    </Redirect>
  </React.StrictMode>
);
