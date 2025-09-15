import React, { useState, useEffect } from 'react';
import cctvService from '../../services/cctvService';

const CCTVCreateModal = ({ isOpen, onClose, onCCTVCreated }) => {
  // DIUBAH: State disesuaikan dengan tabel `cctv_camera` dan `location`
  const [formData, setFormData] = useState({
    camera_name: '',
    ip_address: '',
    id_location: '',
    status: true
  });
  const [locations, setLocations] = useState([]); // BARU: Untuk menyimpan daftar lokasi
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // BARU: Ambil data lokasi saat modal pertama kali dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchLocations = async () => {
        try {
          const locs = await cctvService.getAllLocations();
          setLocations(locs);
        } catch (error) {
          console.error("Failed to fetch locations", error);
        }
      };
      fetchLocations();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // DIUBAH: Validasi disesuaikan dengan field baru
  const validateForm = () => {
    const newErrors = {};
    if (!formData.camera_name.trim()) newErrors.camera_name = 'Nama Kamera harus diisi';
    if (!formData.ip_address.trim()) newErrors.ip_address = 'IP Address harus diisi';
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(formData.ip_address)) newErrors.ip_address = 'Format IP Address tidak valid';
    if (!formData.id_location) newErrors.id_location = 'Lokasi harus dipilih';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await cctvService.createCCTV(formData);
      alert('CCTV berhasil ditambahkan!');
      onCCTVCreated(); // Ini akan menutup modal & refresh data di halaman utama
    } catch (error) {
      alert('Gagal menambahkan CCTV: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Tambah CCTV Baru</h2>
            <button type="button" onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600">
              {/* SVG Close Icon */}
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Camera Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamera <span className="text-red-500">*</span></label>
              <input type="text" name="camera_name" value={formData.camera_name} onChange={handleInputChange} placeholder="e.g., Kamera Lobi Depan"
                className={`w-full ... ${errors.camera_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.camera_name && <p className="mt-1 text-sm text-red-600">{errors.camera_name}</p>}
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address <span className="text-red-500">*</span></label>
              <input type="text" name="ip_address" value={formData.ip_address} onChange={handleInputChange} placeholder="e.g., 192.168.1.100"
                className={`w-full ... ${errors.ip_address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.ip_address && <p className="mt-1 text-sm text-red-600">{errors.ip_address}</p>}
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi <span className="text-red-500">*</span></label>
              <select name="id_location" value={formData.id_location} onChange={handleInputChange}
                className={`w-full ... ${errors.id_location ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Pilih Lokasi</option>
                {locations.map(loc => (
                  <option key={loc.id_location} value={loc.id_location}>{loc.nama_lokasi}</option>
                ))}
              </select>
              {errors.id_location && <p className="mt-1 text-sm text-red-600">{errors.id_location}</p>}
            </div>
            
            {/* Status */}
            <div className="flex items-center">
              <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} className="h-4 w-4 ..."/>
              <label className="ml-2 block text-sm text-gray-700">CCTV aktif/online</label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 ...">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 ...">{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CCTVCreateModal;
