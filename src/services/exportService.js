// src/services/exportService.js
import apiClient from './api';
import authService from './authService';

/**
 * Service untuk handle export data CCTV dan SQL Database
 */
class ExportService {
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
   * Helper untuk menangani error dari Axios
   */
  _handleError(error) {
    console.error('Export Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    let errorMessage = 'Terjadi kesalahan saat export data';
    
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
        errorMessage = 'Anda tidak memiliki akses untuk export data. Hanya Superadmin yang dapat mengakses fitur ini.';
      } else if (error.response.status === 404) {
        errorMessage = 'Endpoint export tidak ditemukan.';
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
   * Export data CCTV ke file Excel atau CSV
   * @param {string} fileType - 'xlsx' atau 'csv'
   * @returns {Promise<Object>} Success response
   */
  async exportCctv(fileType = 'xlsx') {
    try {
      const token = this._getAuthToken();
      console.log('Exporting CCTV with format:', fileType);
      
      // Gunakan query parameters seperti userService
      const response = await apiClient.get(`/cctv/export?token=${token}&file_type=${fileType}`, {
        responseType: 'blob', // Penting untuk download file
        timeout: 60000, // 60 seconds timeout
      });

      console.log('Export response received:', response);

      // Buat blob dari response
      const blob = new Blob([response.data], {
        type: fileType === 'csv' 
          ? 'text/csv;charset=utf-8;'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
      link.setAttribute('download', `cctv_export_${timestamp}.${fileType}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('Export completed successfully');
      return { success: true, message: 'Export berhasil!' };
      
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Export SQL Database
   * @param {string|null} tableName - Nama tabel spesifik atau null untuk semua tabel
   * @returns {Promise<Object>} Success response dengan info file
   */
  async exportSql(tableName = null) {
    try {
      const token = this._getAuthToken();
      console.log('🚀 Exporting SQL Database:', tableName || 'All tables');
      
      // Build URL dengan optional table_name parameter
      let url = `/db/export/sql?token=${token}`;
      if (tableName) {
        url += `&table_name=${encodeURIComponent(tableName)}`;
      }
      
      const response = await apiClient.get(url, {
        responseType: 'blob', // Penting untuk download file
        timeout: 120000, // 120 seconds timeout (SQL dump bisa lama)
      });

      console.log('✅ SQL Export response received:', response);

      // Extract filename dari Content-Disposition header
      let filename = 'database_backup.sql';
      const contentDisposition = response.headers['content-disposition'];
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Buat blob dari response
      const blob = new Blob([response.data], {
        type: 'application/sql'
      });

      // Trigger download
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url_blob;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url_blob);

      console.log('✅ SQL Export completed successfully:', filename);
      return { 
        success: true, 
        message: 'Export SQL Database berhasil!',
        filename: filename 
      };
      
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Export data CCTV dengan format spesifik Excel
   */
  async exportCctvExcel() {
    return this.exportCctv('xlsx');
  }

  /**
   * Export full database (semua tabel)
   */
  async exportFullDatabase() {
    return this.exportSql(null);
  }

  /**
   * Export tabel spesifik
   * @param {string} tableName - Nama tabel yang ingin di-export
   */
  async exportTable(tableName) {
    if (!tableName) {
      throw new Error('Nama tabel harus diisi');
    }
    return this.exportSql(tableName);
  }
}

// Export instance singleton
const exportService = new ExportService();
export default exportService;