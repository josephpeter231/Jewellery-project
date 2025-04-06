import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './ImageUploader.css';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile.type.match('image.*')) return setError('Please select an image file');
    if (selectedFile.size > 5 * 1024 * 1024) return setError('File size should be less than 5MB');
    setError(null);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation();
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  }, []);

  const handleUpload = async () => {
    if (!file) return setError('Please select an image first');

    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadStatus(null);
    setSearchResults([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'godigital');
    formData.append('cloud_name', 'dl3ztdpxc');

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dl3ztdpxc/image/upload',
        formData,
        {
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          },
        }
      );

      const cloudUrl = res.data.secure_url;
      console.log('Cloudinary URL:', cloudUrl);
      setUploadStatus({ success: true, url: cloudUrl });

      const reverseSearch = await axios.post('http://localhost:5000/reverse-image', {
        imageUrl: cloudUrl,
      });

      setSearchResults(reverseSearch.data.images);
    } catch (err) {
      console.error(err);
      setError('Upload or search failed');
      setUploadStatus({ success: false });
    } finally {
      setUploading(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setUploadStatus(null);
    setError(null);
    setSearchResults([]);
  };

  return (
    <div className="uploader-container">
      <h2 className="uploader-title">Upload & Reverse Image Search</h2>

      <div
        className={`drop-area ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!preview ? (
          <div className="drop-message">
            <i className="upload-icon">📁</i>
            <p>Drag & drop your image here or</p>
            <label className="file-input-label">
              Browse Files
              <input type="file" accept="image/*" onChange={handleChange} className="file-input" />
            </label>
            <p className="file-requirements">Supports: JPG, PNG, GIF (Max 5MB)</p>
          </div>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <button className="remove-btn" onClick={resetUploader}>✕</button>
          </div>
        )}
      </div>

      {error && <div className="error-message"><p>{error}</p></div>}

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{progress}% Uploaded</p>
        </div>
      )}

      {uploadStatus && uploadStatus.success && (
        <div className="success-message">
          <p>Upload successful! <a href={uploadStatus.url} target="_blank" rel="noreferrer">View</a></p>
        </div>
      )}

      <div className="button-container">
        <button
          className={`upload-button ${!file || uploading ? 'disabled' : ''}`}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload & Search'}
        </button>

        {preview && !uploading && (
          <button className="reset-button" onClick={resetUploader}>
            Reset
          </button>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="results mt-4">
          <h5>Top Matches:</h5>
          <div className="row">
            {searchResults.map((img, i) => (
              <div key={i} className="col-md-3 mb-3">
                <img src={img} alt={`Result ${i + 1}`} className="img-fluid img-thumbnail" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
