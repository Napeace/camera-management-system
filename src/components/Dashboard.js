import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCameras } from '../services/api';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCameras = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const result = await getCameras(token);
      
      setLoading(false);
      
      if (result.success) {
        setCameras(result.data);
      } else {
        setError(result.message);
        
        // Kalau token expired, redirect ke login
        if (result.message.includes('token') || result.message.includes('unauthorized')) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };

    loadCameras();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Header */}
      <nav style={{
        backgroundColor: 'white',
        padding: '15px 30px',
        borderBottom: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
              🏥 CCTV Management System
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                👤 {user.username}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {user.role === 'superadmin' ? '🔧 Super Admin' : '🔒 Security'}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>
            📹 Camera Monitoring
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Real-time monitoring of {cameras.length} security cameras
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            color: 'white',
            backgroundColor: '#dc3545',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Camera Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', color: '#28a745' }}>
              {cameras.filter(c => c.status === 'active').length}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Online Cameras</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', color: '#dc3545' }}>
              {cameras.filter(c => c.status === 'inactive').length}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Offline Cameras</div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', color: '#007bff' }}>
              {cameras.length}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Cameras</div>
          </div>
        </div>

        {/* Camera Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {cameras.map(camera => (
            <div
              key={camera.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, color: '#333' }}>{camera.name}</h3>
                <span style={{ 
                  color: camera.status === 'active' ? '#28a745' : '#dc3545',
                  fontSize: '18px'
                }}>
                  {camera.status === 'active' ? '🟢' : '🔴'}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>📍 Location:</strong> {camera.location}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>⚡ Status:</strong> 
                  <span style={{ 
                    color: camera.status === 'active' ? '#28a745' : '#dc3545',
                    marginLeft: '5px',
                    fontWeight: 'bold'
                  }}>
                    {camera.status === 'active' ? 'Online' : 'Offline'}
                  </span>
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: camera.status === 'active' ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: camera.status === 'active' ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
                disabled={camera.status !== 'active'}
                >
                  📺 View Stream
                </button>
                
                {user.role === 'superadmin' && (
                  <button style={{
                    padding: '10px 15px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    ⚙️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {cameras.length === 0 && !error && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📹</div>
            <p>No cameras found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;