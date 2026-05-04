import React, { useState, useEffect } from 'react';
import { db, storage, isLive } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useAuth } from '../AuthContext';

const BuildCard = ({ build }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isOwner = user && user.uid === build.userId;

  // Support both single image (legacy) and multiple images (new)
  const images = build.imageUrls || (build.imageUrl ? [build.imageUrl] : []);

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

  const handleDelete = async () => {
    if (!isLive) return alert("Delete feature is disabled in Demo Mode.");
    if (!window.confirm('Are you sure you want to delete this build? This will also remove all images and comments.')) return;

    try {
      // 1. Delete images from Storage if they exist
      if (build.imageUrls && build.imageUrls.length > 0) {
        const deletePromises = build.imageUrls.map(url => {
          // Only attempt to delete if it's a Firebase Storage URL
          if (url.includes('firebasestorage.googleapis.com')) {
            const imageRef = ref(storage, url);
            return deleteObject(imageRef).catch(err => console.warn("Failed to delete image:", err));
          }
          return Promise.resolve();
        });
        await Promise.all(deletePromises);
      } else if (build.imageUrl && build.imageUrl.includes('firebasestorage.googleapis.com')) {
        const imageRef = ref(storage, build.imageUrl);
        await deleteObject(imageRef).catch(err => console.warn("Failed to delete image:", err));
      }

      // 2. Delete the build document (comments subcollection will be orphaned but inaccessible)
      await deleteDoc(doc(db, 'builds', build.id));
    } catch (error) {
      console.error("Error deleting build:", error);
      alert("Failed to delete build.");
    }
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

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="build-card">
      <div className="card-header">
        <div className="user-info">
          <img src={build.userPhoto || 'https://via.placeholder.com/40'} alt={build.userName} className="avatar" />
          <span className="username">{build.userName}</span>
        </div>
        {isOwner && (
          <button className="delete-btn" onClick={handleDelete} title="Delete build">
            🗑️
          </button>
        )}
      </div>
      
      <div className="card-image-wrapper">
        <img src={images[currentImgIndex]} alt={build.title} className="build-image" />
        
        {images.length > 1 && (
          <>
            <button className="slider-btn prev" onClick={prevImage}>❮</button>
            <button className="slider-btn next" onClick={nextImage}>❯</button>
            <div className="slider-dots">
              {images.map((_, i) => (
                <span key={i} className={`dot ${i === currentImgIndex ? 'active' : ''}`}></span>
              ))}
            </div>
          </>
        )}
      </div>
      
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
