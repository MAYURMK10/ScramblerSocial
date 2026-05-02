import React, { useState, useEffect } from 'react';
import { db, isLive } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import BuildCard from './BuildCard';

const Feed = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLive) {
      setBuilds([
        {
          id: 'demo1',
          title: 'Vintage Scrambler CB350',
          description: 'Restored 1972 Honda with custom exhaust and knobby tires.',
          imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&w=800&q=80',
          userName: 'VintageMoto',
          likes: ['1', '2']
        },
        {
          id: 'demo2',
          title: 'Modern Desert Sled',
          description: 'Custom Ducati Scrambler with upgraded suspension and sand tires.',
          imageUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80',
          userName: 'DesertRider',
          likes: ['3']
        }
      ]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'builds'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBuilds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return <div className="loader">Loading builds...</div>;

  return (
    <div className="builds-grid">
      {builds.length === 0 ? (
        <p className="empty-msg">No builds yet. Be the first to share!</p>
      ) : (
        builds.map(build => (
          <BuildCard key={build.id} build={build} />
        ))
      )}
    </div>
  );
};

export default Feed;
