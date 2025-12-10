// src/services/importService.js
import apiClient from './api';
import authService from './authService';

/**
 * Service untuk handle import data CCTV dan Users
 */
class ImportService {
  /**
   * Helper untuk mendapatkan token
   */
  _getAuthToken() {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error("Token autentikasi tidak ditemukan. Silakan login kembali.");
    }
    return token;
  }

  /**
   * Helper untuk menangani respons dan error
   */
  _handleResponse(response) {
    if (response.data && response.data.status === 'success') {
      return response.data;
    }
    // Jika backend mengembalikan 200 OK tapi status logisnya 'error'
    throw new Error(response.data.message || "Struktur respons API tidak valid.");
  }

  /**
   * Helper untuk menangani error dari Axios
   */
  _handleError(error) {
    console.error('Import Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    let errorMessage = 'Terjadi kesalahan saat import data';
    
    if (error.response?.data) {
      const data = error.response.data;
      
      // =================================================================
      // === PERBAIKAN LOGIKA: TANGANI ERROR 400 DENGAN DETAIL CUSTOM ===
      // =================================================================
      // Cek apakah status 400 dan memiliki format detail custom (message & errors array)
      if (error.response.status === 400 && data.detail && Array.isArray(data.detail.errors)) {
          const customDetail = data.detail;
          
          let customMessage = customDetail.message || 'Terdapat kesalahan duplikasi data:';
          
          // Gabungkan semua pesan error spesifik dari array 'errors' menjadi string yang rapi
          const detailedErrors = customDetail.errors.map(err => `- ${err}`).join('\n');
          errorMessage = `${customMessage}\n\n${detailedErrors}`;
          
          // Karena error ini sudah ditangani secara spesifik, langsung lempar dan keluar.
          throw new Error(errorMessage);
      }
      
      // =================================================================
      // === LOGIKA STANDAR (FastAPI Pydantic Error 422, atau Status/Message Lain) ===
      // =================================================================
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          // 422 (Unprocessable Entity) - FastAPI Pydantic validation error format
          errorMessage = data.detail
            .map(err => {
              // Ambil nama field terakhir di lokasi error
              const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
              return `${field}: ${err.msg}`;
            })
            .join('\n');
        } else if (typeof data.detail === 'string') {
          // Detail adalah string biasa (bisa dari HTTPException non-custom)
          errorMessage = data.detail;
        }
      } else if (data.message) {
        // Cek jika ada kunci 'message' di level root data
        errorMessage = data.message;
      } else if (typeof data === 'string') {
        // Data response adalah string biasa
        errorMessage = data;
      } else {
        // Status code specific messages (Hanya untuk error yang tidak memiliki detail/message)
        switch (error.response.status) {
          case 400:
            // Pesan ini hanya akan terpicu jika error 400 tidak memiliki detail sama sekali
            errorMessage = 'Format file tidak valid. Pastikan kolom Excel sesuai template.';
            break;
          case 401:
            errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
            break;
          case 403:
            errorMessage = 'Anda tidak memiliki akses untuk import data.';
            break;
          case 404:
            errorMessage = 'Endpoint import tidak ditemukan.';
            break;
          case 413:
            errorMessage = 'File terlalu besar. Maksimal ukuran file adalah 10MB.';
            break;
          case 422:
            errorMessage = 'Data tidak valid. Periksa kembali format data di Excel.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.';
            break;
          default:
            errorMessage = 'Terjadi kesalahan saat import data.';
        }
      }
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }

  /**
   * Import data CCTV dari file Excel
   * @param {FormData} formData - FormData yang berisi file Excel
   * @returns {Promise<Object>} Response dengan imported_count
   */
  async importCctv(formData) {
    try {
       const response = await apiClient.post('/cctv/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout untuk import operations
      });
       // Handle different response formats
      let importedCount = 0;
      
      if (response.data.status === 'success') {
        // Format 1: { status: "success", imported_count: X }
        if (response.data.imported_count !== undefined) {
          importedCount = response.data.imported_count;
        } 
        // Format 2 & 3: Response menggunakan 'data' key untuk count
        else if (response.data.data && typeof response.data.data === 'object') {
          // Mengambil dari total_imported jika menggunakan format:
          // { data: { total_imported: X, total_updated: Y } }
          importedCount = response.data.data.total_imported || 0;
        }
        
        return {
          success: true,
          imported_count: importedCount,
          message: response.data.message || `Berhasil mengimport ${importedCount} data CCTV`
        };
      }
      
      throw new Error('Import gagal: Response tidak valid');
      
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Import data Users dari file Excel
   * Format Excel:
   * - Nama (required)
   * - Username (required)
   * - Nik (required, format: 1234.56789 atau 12345.123456)
   * - Password (optional, default: Rsch123)
   * - Role (required, contoh: SuperAdmin atau Security)
   * * @param {FormData} formData - FormData yang berisi file Excel
   * @returns {Promise<Object>} Response dengan imported_count
   */
  async importUsers(formData) {
    try {
       const response = await apiClient.post('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout untuk import operations
      });
       // Backend mengembalikan { status: "success", imported_count: X }
      if (response.data.status === 'success') {
        return {
          success: true,
          imported_count: response.data.imported_count || 0,
          message: `Berhasil mengimport ${response.data.imported_count} user baru`
        };
      }
      
      throw new Error('Import gagal: Response tidak valid');
      
    } catch (error) {
      this._handleError(error);
    }
  }
}

// Export instance singleton
const importService = new ImportService();
export default importService;