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
    </div>
  );
}

export default App;
