import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap for styling

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router> {/* ✅ Wrap everything inside Router */}

      <App />

  </Router>
);
