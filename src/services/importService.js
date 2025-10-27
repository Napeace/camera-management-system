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
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        // Handle Pydantic validation errors
        if (Array.isArray(error.response.data.detail)) {
          const firstError = error.response.data.detail[0];
          errorMessage = firstError.msg || 'Validation error';
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki akses untuk import data.';
      } else if (error.response.status === 404) {
        errorMessage = 'Endpoint import tidak ditemukan.';
      } else if (error.response.status === 400) {
        errorMessage = 'Format data tidak valid. Periksa kembali file Excel Anda.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.';
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
      const token = this._getAuthToken();
      console.log('Importing CCTV data from Excel file');
      
      // Append token ke formData
      formData.append('token', token);
      
      const response = await apiClient.post(`/cctv/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout untuk import operations
      });
      
      console.log('Import CCTV response:', response);
      
      // Backend mengembalikan { status: "success", imported_count: X }
      if (response.data.status === 'success') {
        return {
          success: true,
          imported_count: response.data.imported_count || 0,
          message: `Berhasil mengimport ${response.data.imported_count} data CCTV`
        };
      }
      
      throw new Error('Import gagal: Response tidak valid');
      
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Import data Users dari file Excel
   * @param {FormData} formData - FormData yang berisi file Excel
   * @returns {Promise<Object>} Response dengan detail import
   */
  async importUsers(formData) {
    try {
      const token = this._getAuthToken();
      console.log('Importing Users data from Excel file');
      
      // Append token ke formData
      formData.append('token', token);
      
      const response = await apiClient.post(`/users/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout untuk import operations
      });
      
      console.log('Import Users response:', response);
      
      return this._handleResponse(response);
      
    } catch (error) {
      this._handleError(error);
    }
  }
}

// Export instance singleton
const importService = new ImportService();
export default importService;