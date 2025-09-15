import React, { useState, useEffect } from 'react';
import cctvService from '../../services/cctvService';

const CCTVEditModal = ({ isOpen, onClose, cctvToEdit, onCCTVUpdated }) => {
  // DIUBAH: State disesuaikan
  const [formData, setFormData] = useState({
    camera_name: '',
    ip_address: '',
    id_location: '',
    status: true
  });
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // BARU: Ambil data lokasi dan isi form saat modal dibuka
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

      if (cctvToEdit) {
        setFormData({
          camera_name: cctvToEdit.camera_name || '',
          ip_address: cctvToEdit.ip_address || '',
          id_location: cctvToEdit.location?.id_location || '',
          status: cctvToEdit.status,
        });
      }
    }
  }, [isOpen, cctvToEdit]);
  
  // ... (handleInputChange dan validateForm sama seperti di CreateModal)

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!validateForm()) return; // Validasi juga diperlukan di sini

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

  if (!isOpen) return null;

  return (
    // JSX Mirip dengan CreateModal, hanya judul dan beberapa value yang berbeda
    // Anda bisa menyalin JSX dari CreateModal dan menyesuaikannya
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
         <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Edit CCTV #{cctvToEdit.id_cctv}</h2>
                {/* ... Tombol close ... */}
            </div>
            {/* ... Form Body (sama seperti Create, tapi value dari formData) ... */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                <button type="button" onClick={onClose} disabled={loading} className="...">Batal</button>
                <button type="submit" disabled={loading} className="...">{loading ? 'Mengupdate...' : 'Update'}</button>
            </div>
         </form>
       </div>
    </div>
  );
};

export default CCTVEditModal;
