// DIKEMBALIKAN KE VERSI STATIS
// File ini menggunakan data mock/statis untuk development, sesuai permintaan.

const cctvDataFromPDF = [
  // Data lengkap dari file Anda...
  // DVR Pusat - IP Cameras
  { id: 1, name: 'Dahua Camera 1', location: 'TPS', ip_address: '192.168.10.105', type: 'ip', brand: 'Dahua', status: true, dvr_group: 'DVR Pusat' },
  { id: 2, name: 'Dahua Camera 2', location: 'Depan ICU', ip_address: '192.168.10.187', type: 'ip', brand: 'Dahua', status: true, dvr_group: 'DVR Pusat' },
  { id: 3, name: 'Dahua Camera 3', location: 'Pos Pintu Masuk lorong depan RSCH', ip_address: '192.168.10.193', type: 'ip', brand: 'Dahua', status: false, dvr_group: 'DVR Pusat' },
  { id: 4, name: 'Dahua Camera 4', location: 'Ruang Farmasi RJ', ip_address: '192.168.10.213', type: 'ip', brand: 'Dahua', status: true, dvr_group: 'DVR Pusat' },
  { id: 5, name: 'Dahua Camera 5', location: 'Pintu Masuk Farmasi RJ', ip_address: '192.168.10.221', type: 'ip', brand: 'Dahua', status: true, dvr_group: 'DVR Pusat' },
  // ... tambahkan sisa data CCTV Anda di sini
  { id: 50, name: 'Dahua Camera 10', location: 'Anturium 10', ip_address: '192.168.1.110', type: 'ip', brand: 'Dahua', status: true, dvr_group: 'DVR Anturium' },
];

class CCTVService {
  // Get all CCTV cameras with filters (from static data)
  getAllCCTV(filters = {}) {
    let filteredData = [...cctvDataFromPDF];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(cctv => 
        cctv.name.toLowerCase().includes(searchLower) ||
        cctv.location.toLowerCase().includes(searchLower) ||
        cctv.ip_address.toLowerCase().includes(searchLower)
      );
    }
    if (filters.status !== undefined) {
      filteredData = filteredData.filter(cctv => cctv.status === filters.status);
    }
    if (filters.dvr_group) {
      filteredData = filteredData.filter(cctv => cctv.dvr_group === filters.dvr_group);
    }
    if (filters.type) {
      filteredData = filteredData.filter(cctv => cctv.type === filters.type);
    }
    return { data: filteredData, total: filteredData.length };
  }

  // Get CCTV by DVR group (for live monitoring)
  getCCTVByDVRGroup(dvrGroup) {
    const filteredData = cctvDataFromPDF.filter(cctv => cctv.dvr_group === dvrGroup);
    return { data: filteredData, total: filteredData.length };
  }

  // FUNGSI DIKEMBALIKAN: Ini akan memperbaiki error
  getDVRGroups() {
    const groups = [...new Set(cctvDataFromPDF.map(cctv => cctv.dvr_group))];
    return groups.sort();
  }

  // DIKEMBALIKAN: Statistik dengan tipe kamera
  getStatistics() {
    const total = cctvDataFromPDF.length;
    const online = cctvDataFromPDF.filter(cctv => cctv.status).length;
    const offline = total - online;
    const ipCameras = cctvDataFromPDF.filter(cctv => cctv.type === 'ip').length;
    const analogCameras = cctvDataFromPDF.filter(cctv => cctv.type === 'analog').length;
    return { total, online, offline, ipCameras, analogCameras };
  }

  // --- Fungsi CRUD (simulasi) ---
  createCCTV(cctvData) {
    console.log('Creating CCTV (simulation):', cctvData);
    const newCCTV = { id: cctvDataFromPDF.length + 1, ...cctvData };
    cctvDataFromPDF.push(newCCTV);
    return Promise.resolve({ success: true, data: newCCTV });
  }

  updateCCTV(cctvId, cctvData) {
    console.log('Updating CCTV (simulation):', cctvId, cctvData);
    const index = cctvDataFromPDF.findIndex(c => c.id === cctvId);
    if (index !== -1) {
      cctvDataFromPDF[index] = { ...cctvDataFromPDF[index], ...cctvData };
      return Promise.resolve({ success: true, data: cctvDataFromPDF[index] });
    }
    return Promise.reject(new Error('CCTV not found'));
  }

  deleteCCTV(cctvId) {
    console.log('Deleting CCTV (simulation):', cctvId);
    return Promise.resolve({ success: true, message: 'CCTV deleted successfully' });
  }
}

const cctvService = new CCTVService();
export default cctvService;

