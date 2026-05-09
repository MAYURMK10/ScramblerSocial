import React, { useState } from 'react';
import { db, storage, isLive } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { analyzeBikeImage } from '../aiService';

const UploadForm = ({ onComplete }) => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [baseBike, setBaseBike] = useState('');
  const [modifications, setModifications] = useState([]);
  const [newMod, setNewMod] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log("📸 UploadForm: Files selected:", files.length);
    
    if (files.length > 0) {
      const isFirstUpload = images.length === 0;
      console.log("📸 UploadForm: Is this the first upload?", isFirstUpload);
      
      const newImages = [...images, ...files].slice(0, 5);
      setImages(newImages);
      
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);

      // Trigger AI Analysis on the first image added
      if (isFirstUpload && files[0]) {
        console.log("📸 UploadForm: Triggering AI analysis...");
        setAnalyzing(true);
        const aiResult = await analyzeBikeImage(files[0]);
        console.log("📸 UploadForm: AI analysis result received:", aiResult);
        
        if (aiResult) {
          setTitle(aiResult.suggestedTitle || '');
          setDescription(aiResult.suggestedDescription || '');
          setBaseBike(aiResult.baseBike || '');
          setModifications(aiResult.modifications || []);
        } else {
          console.warn("📸 UploadForm: AI result was empty or failed.");
        }
        setAnalyzing(false);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const addMod = (e) => {
    e.preventDefault();
    if (newMod.trim()) {
      setModifications([...modifications, newMod.trim()]);
      setNewMod('');
    }
  };

  const removeMod = (index) => {
    setModifications(modifications.filter((_, i) => i !== index));
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
        baseBike,
        modifications,
        imageUrls: urls,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        likes: [],
        createdAt: serverTimestamp(),
      });

      setUploading(false);
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
          {analyzing && <p className="ai-status">✨ AI is analyzing your bike parts...</p>}
        </div>

        <div className="form-group">
          <label>Build Title</label>
          <input 
            type="text" 
            placeholder="e.g. 1974 Honda CB450 Brat" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Base Bike (Make/Model)</label>
          <input 
            type="text" 
            placeholder="e.g. Honda CB450" 
            value={baseBike}
            onChange={(e) => setBaseBike(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Modifications</label>
          <div className="mods-input">
            <input 
              type="text" 
              placeholder="Add a mod (e.g. Custom Exhaust)" 
              value={newMod}
              onChange={(e) => setNewMod(e.target.value)}
            />
            <button type="button" onClick={addMod} className="btn-add-mod">Add</button>
          </div>
          <div className="mods-list">
            {modifications.map((mod, index) => (
              <span key={index} className="mod-tag">
                {mod} <button type="button" onClick={() => removeMod(index)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            placeholder="Tell us about your build..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading || analyzing || images.length === 0}>
          {uploading ? 'Uploading...' : `Post Build (${images.length} photos)`}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
