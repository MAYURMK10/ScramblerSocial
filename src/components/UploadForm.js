import React, { useState } from 'react';
import { db, storage, isLive } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

const UploadForm = ({ onComplete }) => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !user) return;

    if (!isLive) {
      alert("Upload feature is disabled in Demo Mode. Update .env.local with real keys.");
      if (onComplete) onComplete();
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `builds/${Date.now()}_${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        console.error(error);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'builds'), {
          title,
          description,
          imageUrl: url,
          userId: user.uid,
          userName: user.displayName,
          userPhoto: user.photoURL,
          likes: [],
          createdAt: serverTimestamp(),
        });
        setUploading(false);
        setTitle('');
        setDescription('');
        setImage(null);
        setPreview(null);
        if (onComplete) onComplete();
      }
    );
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleUpload} className="upload-form">
        <h3>Upload Your Build</h3>
        
        <div className="image-input-group">
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" />
              <button type="button" onClick={() => {setImage(null); setPreview(null);}} className="btn-remove">Remove</button>
            </div>
          ) : (
            <label className="file-label">
              <input type="file" onChange={handleImageChange} accept="image/*" hidden />
              <span>Select Bike Photo</span>
            </label>
          )}
        </div>

        <input 
          type="text" 
          placeholder="Build Title (e.g. 1974 Honda CB450)" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea 
          placeholder="Tell us about your build..." 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary" disabled={uploading || !image}>
          {uploading ? `Uploading ${Math.round(progress)}%` : 'Post Build'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
