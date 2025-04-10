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

      const reverseSearch = await axios.post('https://jewellery-project-mg0o.onrender.com/reverse-image', {
        imageUrl: cloudUrl,
      });

      setSearchResults(reverseSearch.data.results);
      console.log('Search Results:', reverseSearch.data.results);
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
      <header className="uploader-header">
        <h1 className="uploader-title">Jewellery Vision Search</h1>
        <p className="uploader-subtitle">Find matching designs from our curated collection</p>
      </header>

      <div
        className={`drop-area ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!preview ? (
          <div className="drop-message">
            <div className="upload-icon-container">
              <i className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.5.5 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z"/>
                </svg>
              </i>
            </div>
            <h3 className="drop-heading">Upload Your Jewellery Image</h3>
            <p className="drop-text">Drag and drop or select a file to find similar designs</p>
            <label className="file-input-label">
              Browse Gallery
              <input type="file" accept="image/*" onChange={handleChange} className="file-input" />
            </label>
            <p className="file-requirements">Supports: JPG, PNG, GIF (Max 5MB)</p>
          </div>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <button className="remove-btn" onClick={resetUploader} aria-label="Remove image">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="message-container error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          <p>{error}</p>
        </div>
      )}

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{progress}% Uploaded</p>
        </div>
      )}

      {uploadStatus && uploadStatus.success && (
        <div className="message-container success-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          <p>Upload successful! <a href={uploadStatus.url} target="_blank" rel="noreferrer">View Original Image</a></p>
        </div>
      )}

      <div className="button-container">
        <button
          className={`primary-button ${!file || uploading ? 'disabled' : ''}`}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="spinner">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              Find Similar Designs
            </>
          )}
        </button>

        {preview && !uploading && (
          <button className="secondary-button" onClick={resetUploader}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
            </svg>
            Reset
          </button>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="results-section">
          <h2 className="results-title">Similar Jewellery Designs</h2>
          <div className="results-grid">
            {searchResults.map((item, i) => (
              <div key={i} className="result-card">
                <div className="result-image-container">
                  <a href={item.link} target="_blank" rel="noreferrer">
                    <img src={item.image} alt={item.title || `Result ${i + 1}`} className="result-image" />
                  </a>
                </div>
                <div className="result-details">
                  {item.title && <h3 className="result-title">{item.title}</h3>}
                  {item.price && <p className="result-price">{item.price.value || item.price}</p>}
                  {item.source && <p className="result-source">{item.source}</p>}
                  <a href={item.link} target="_blank" rel="noreferrer" className="view-button">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                      <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
