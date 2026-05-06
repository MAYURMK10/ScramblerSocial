import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, isLive } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import BuildCard from './BuildCard';

const BuildDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLive) {
      // Mock data for demo mode
      setBuild({
        id: id,
        title: 'Demo Build Detail',
        description: 'This is a detailed view of the build in demo mode.',
        imageUrls: ['https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&w=800&q=80'],
        userName: 'DemoUser',
        likes: []
      });
      setLoading(false);
      return;
    }

    const buildRef = doc(db, 'builds', id);
    const unsubscribe = onSnapshot(buildRef, (doc) => {
      if (doc.exists()) {
        setBuild({ id: doc.id, ...doc.data() });
      } else {
        console.error("Build not found");
        navigate('/');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id, navigate]);

  if (loading) return <div className="loader">Loading build details...</div>;
  if (!build) return <div className="loader">Build not found.</div>;

  return (
    <div className="container detail-view">
      <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        ← Back
      </button>
      <div className="detail-grid">
        <BuildCard build={build} />
      </div>
    </div>
  );
};

export default BuildDetail;
