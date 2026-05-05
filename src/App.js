import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import UploadForm from './components/UploadForm';
import { useAuth } from './AuthContext';
import './App.css';

function App() {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <header className="hero">
          <h2>Showcase your custom Scrambler.</h2>
          <p>The community for custom bike enthusiasts.</p>
          {user && (
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '20px' }}
              onClick={() => setShowUpload(!showUpload)}
            >
              {showUpload ? 'Close Upload' : 'Share Your Build'}
            </button>
          )}
        </header>
        
        {showUpload && user && (
          <UploadForm onComplete={() => setShowUpload(false)} />
        )}

        <Feed />
      </main>

      {user && (
        <button 
          className={`fab-upload ${showUpload ? 'active' : ''}`}
          onClick={() => setShowUpload(!showUpload)}
          aria-label="Toggle upload"
        >
          {showUpload ? '×' : '+'}
        </button>
      )}

      {process.env.NODE_ENV === 'development' && (
        <footer className="dev-footer">
          <p>📱 Access from your phone: <code>http://192.168.0.106:3000</code></p>
        </footer>
      )}
    </div>
  );
}

export default App;
