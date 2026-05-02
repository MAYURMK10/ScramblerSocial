import React, { useState, useEffect } from 'react';
import { db, isLive } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

const BuildCard = ({ build }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isLiked = user && build.likes?.includes(user.uid);

  useEffect(() => {
    if (!isLive) return;
    const q = query(
      collection(db, 'builds', build.id, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [build.id]);

  const handleLike = async () => {
    if (!user) return alert('Please login to like!');
    if (!isLive) return alert("Like feature is disabled in Demo Mode.");
    const buildRef = doc(db, 'builds', build.id);
    await updateDoc(buildRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    if (!isLive) return alert("Comment feature is disabled in Demo Mode.");

    await addDoc(collection(db, 'builds', build.id, 'comments'), {
      text: newComment,
      userId: user.uid,
      userName: user.displayName,
      createdAt: serverTimestamp()
    });
    setNewComment('');
  };

  return (
    <div className="build-card">
      <div className="card-header">
        <img src={build.userPhoto || 'https://via.placeholder.com/40'} alt={build.userName} className="avatar" />
        <span className="username">{build.userName}</span>
      </div>
      
      <img src={build.imageUrl} alt={build.title} className="build-image" />
      
      <div className="card-content">
        <h4>{build.title}</h4>
        <p className="description">{build.description}</p>
        
        <div className="card-stats">
          <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
            {isLiked ? '❤️' : '🤍'} {build.likes?.length || 0}
          </button>
          <button className="comment-toggle" onClick={() => setShowComments(!showComments)}>
            💬 {comments.length}
          </button>
        </div>

        {showComments && (
          <div className="comments-section">
            <div className="comments-list">
              {comments.map(c => (
                <div key={c.id} className="comment">
                  <strong>{c.userName}</strong>: {c.text}
                </div>
              ))}
            </div>
            {user && (
              <form onSubmit={handleAddComment} className="comment-form">
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildCard;
