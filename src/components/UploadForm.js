import React, { useState } from 'react';
import { db, storage, isLive } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

const UploadForm = ({ onComplete }) => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = [...images, ...files].slice(0, 5); // Limit to 5 images
      setImages(newImages);
      
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (images.length === 0 || !user) return;

    if (!isLive) {
      alert("Upload feature is disabled in Demo Mode. Update .env.local with real keys.");
      if (onComplete) onComplete();
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = images.map(async (img) => {
        const storageRef = ref(storage, `builds/${Date.now()}_${img.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, img);
        return getDownloadURL(uploadTask.ref);
      });

      const urls = await Promise.all(uploadPromises);

      await addDoc(collection(db, 'builds'), {
        title,
        description,
        imageUrls: urls, // Store array of URLs
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        likes: [],
        createdAt: serverTimestamp(),
      });

      setUploading(false);
      setTitle('');
      setDescription('');
      setImages([]);
      setPreviews([]);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleUpload} className="upload-form">
        <h3>Upload Your Build</h3>
        
        <div className="image-input-group">
          <div className="previews-grid">
            {previews.map((url, index) => (
              <div key={index} className="preview-container">
                <img src={url} alt={`Preview ${index}`} />
                <button type="button" onClick={() => removeImage(index)} className="btn-remove">×</button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="file-label-small">
                <input type="file" onChange={handleImageChange} accept="image/*" hidden multiple />
                <span>+ Add {images.length > 0 ? 'More' : 'Photos'}</span>
              </label>
            )}
          </div>
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

        <button type="submit" className="btn btn-primary" disabled={uploading || images.length === 0}>
          {uploading ? 'Uploading...' : `Post Build (${images.length} photos)`}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
