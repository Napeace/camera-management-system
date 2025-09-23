import React, { useState, useEffect } from 'react';
import cctvService from '../../services/cctvService';

const CCTVEditModal = ({ isOpen, onClose, cctvToEdit, onCCTVUpdated }) => {
  const [formData, setFormData] = useState({
    titik_letak: '',
    ip_address: '',
    id_location: '',
    status: true
  });
  const [originalData, setOriginalData] = useState({});
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Load locations and populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLocations();
      
      if (cctvToEdit) {
        const initialData = {
          titik_letak: cctvToEdit.titik_letak || '',
          ip_address: cctvToEdit.ip_address || '',
          id_location: cctvToEdit.id_location || '',
          status: cctvToEdit.status
        };
        
        setFormData(initialData);
        setOriginalData(initialData);
      }
      setErrors({});
    }
  }, [isOpen, cctvToEdit]);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const locs = await cctvService.getAllLocations();
      setLocations(locs);
    } catch (error) {
      console.error("Failed to fetch locations", error);
      alert('Gagal memuat data lokasi: ' + error.message);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titik_letak.trim()) {
      newErrors.titik_letak = 'Titik letak harus diisi';
    } else if (formData.titik_letak.length < 5) {
      newErrors.titik_letak = 'Titik letak minimal 5 karakter';
    }
    
    if (!formData.ip_address.trim()) {
      newErrors.ip_address = 'IP Address harus diisi';
    } else {
      // Basic IP validation
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(formData.ip_address)) {
        newErrors.ip_address = 'Format IP Address tidak valid';
      }
    }
    
    if (!formData.id_location) {
      newErrors.id_location = 'Lokasi harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form has changes
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      alert('Tidak ada perubahan data.');
      return;
    }
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await cctvService.updateCCTV(cctvToEdit.id_cctv, formData);
      alert('CCTV berhasil diupdate!');
      onCCTVUpdated();
    } catch (error) {
      alert('Gagal mengupdate CCTV: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen || !cctvToEdit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit CCTV #{cctvToEdit.id_cctv}
            </h2>
            <button 
              type="button" 
              onClick={handleCancel} 
              disabled={loading} 
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Titik Letak */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titik Letak <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="titik_letak" 
                value={formData.titik_letak} 
                onChange={handleInputChange} 
                placeholder="e.g., Lorong Depan ICU"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.titik_letak ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
              />
              {errors.titik_letak && <p className="mt-1 text-sm text-red-600">{errors.titik_letak}</p>}
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Address <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="ip_address" 
                value={formData.ip_address} 
                onChange={handleInputChange} 
                placeholder="e.g., 192.168.1.100"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.ip_address ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
              />
              {errors.ip_address && <p className="mt-1 text-sm text-red-600">{errors.ip_address}</p>}
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <select 
                name="id_location" 
                value={formData.id_location} 
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${errors.id_location ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading || loadingLocations}
              >
                <option value="">
                  {loadingLocations ? 'Memuat lokasi...' : 'Pilih Lokasi'}
                </option>
                {locations.map(loc => (
                  <option key={loc.id_location} value={loc.id_location}>
                    {loc.nama_lokasi || loc.location_name}
                  </option>
                ))}
              </select>
              {errors.id_location && <p className="mt-1 text-sm text-red-600">{errors.id_location}</p>}
            </div>
            
            {/* Status */}
            <div className="flex items-center">
              <input 
                type="checkbox" 
                name="status" 
                checked={formData.status} 
                onChange={handleInputChange} 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label className="ml-2 block text-sm text-gray-700">
                CCTV aktif/online
              </label>
            </div>

            {/* Change indicator */}
            {hasChanges() && (
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ada perubahan yang belum disimpan
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button 
              type="button" 
              onClick={handleCancel} 
              disabled={loading} 
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading || loadingLocations || !hasChanges()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Mengupdate...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CCTVEditModal;