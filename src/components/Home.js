import React, { useState } from 'react';
import Feed from './Feed';
import UploadForm from './UploadForm';
import { useAuth } from '../AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
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

      {user && (
        <button 
          className={`fab-upload ${showUpload ? 'active' : ''}`}
          onClick={() => setShowUpload(!showUpload)}
          aria-label="Toggle upload"
        >
          {showUpload ? '×' : '+'}
        </button>
      )}
    </>
  );
};

export default Home;
