import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LocationPicker from '../components/LocationPicker';
import Sidebar from '../components/Sidebar';
import { storeService } from '../services/api';
import '../styles/Dashboard.css';

/**
 * Store Profile Setup Page
 * For store managers to complete their store profile after signup
 */
const StoreProfileSetup = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeImage: '',
    location: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, storeImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, location });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.storeName || !formData.location) {
      toast.error('Please fill in store name and select location');
      return;
    }

    try {
      const storeData = {
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        storeImage: formData.storeImage,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        address: formData.location.address
      };
      
      await storeService.createOrUpdateStore(storeData);
      toast.success('Store profile saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving store profile:', error);
      toast.error('Failed to save store profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={handleLogout} userRole="STORE_MANAGER" />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="search-bar">
            <h2>Complete Your Store Profile</h2>
          </div>
          
          <div className="header-actions">
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="profile-setup-container">
            <div className="setup-header">
              <h1>🏪 Set Up Your Store</h1>
              <p>Help customers and NGOs find your store by completing your profile</p>
            </div>

            <form onSubmit={handleSubmit} className="store-profile-form">
              
              {/* Store Name */}
              <div className="form-group">
                <label htmlFor="storeName">Store Name *</label>
                <input
                  type="text"
                  id="storeName"
                  placeholder="e.g., Fresh Market Boston"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              </div>

              {/* Store Description */}
              <div className="form-group">
                <label htmlFor="storeDescription">Store Description</label>
                <textarea
                  id="storeDescription"
                  rows="4"
                  placeholder="Tell customers about your store..."
                  value={formData.storeDescription}
                  onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                />
              </div>

              {/* Store Image */}
              <div className="form-group">
                <label htmlFor="storeImage">Store Image/Logo</label>
                <div className="image-upload-wrapper">
                  {previewImage ? (
                    <div className="image-preview-container">
                      <img src={previewImage} alt="Store preview" className="preview-img" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData({ ...formData, storeImage: '' });
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="storeImage" className="upload-area">
                      <div className="upload-icon">📸</div>
                      <p className="upload-text">Click to upload store image</p>
                      <p className="upload-hint">JPG, PNG, or GIF (Max 5MB)</p>
                    </label>
                  )}
                  <input
                    type="file"
                    id="storeImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Location Picker */}
              <div className="form-group">
                <label>Store Location *</label>
                <p className="helper-text">Click on the map to set your store location</p>
                <LocationPicker 
                  initialLocation={formData.location}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
                  Skip for Now
                </button>
                <button type="submit" className="btn-primary">
                  Save Store Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfileSetup;
