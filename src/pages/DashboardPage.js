import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';

// Import Heroicons yang akan digunakan, termasuk ChevronDownIcon
import {
  VideoCameraIcon,
  UserGroupIcon,
  SignalIcon,
  SignalSlashIcon,
  EyeIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const DashboardContent = ({ showSuccess, showInfo, showError, showWarning, navigate }) => {
  // Data untuk card statistik, sekarang menggunakan referensi komponen Ikon
  const stats = [
    { label: 'Total Kamera', value: '108', Icon: VideoCameraIcon, color: 'blue' },
    { label: 'Total Pengguna', value: '14', Icon: UserGroupIcon, color: 'blue' },
    { label: 'Online Kamera', value: '69', Icon: SignalIcon, color: 'green' },
    { label: 'Offline Kamera', value: '14', Icon: SignalSlashIcon, color: 'red' },
  ];

  const lastLogin = [
    { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
    { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
    { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
  ];

  const handleStatCardClick = useCallback((statData) => {
    console.log('Stat card clicked:', statData);
    
    switch (statData.label) {
      case 'Total Kamera':
        showInfo('Camera Info', `You have ${statData.value} cameras in total`);
        break;
      case 'Online Kamera':
        showSuccess('Online Status', `${statData.value} cameras are currently online`);
        break;
      case 'Offline Kamera':
        if (parseInt(statData.value) > 0) {
          showWarning('Offline Cameras', `${statData.value} cameras are currently offline`);
        } else {
          showSuccess('All Online', 'All cameras are online');
        }
        break;
      case 'Total Pengguna':
        showInfo('User Info', `Total ${statData.value} users registered`);
        break;
      default:
        showInfo('Stat Info', `${statData.label}: ${statData.value}`);
    }
  }, [showInfo, showSuccess, showWarning]);

  const staticHistoryData = [
    { id_history: 1, id_cctv: 1, ip_address: "192.168.1.101", location_name: "Lobby Utama", error_time: "2024-01-15T10:30:00Z", status: false },
    { id_history: 2, id_cctv: 2, ip_address: "192.168.1.102", location_name: "Ruang Server", error_time: "2024-01-15T09:15:00Z", status: false },
    { id_history: 3, id_cctv: 3, ip_address: "192.168.1.103", location_name: "Parkiran Depan", error_time: "2024-01-14T16:45:00Z", status: true },
    { id_history: 4, id_cctv: 4, ip_address: "192.168.1.104", location_name: "Koridor Lantai 2", error_time: "2024-01-14T14:20:00Z", status: false },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {stats.map((stat, index) => {
              const StatIcon = stat.Icon;
              return (
                <div
                  key={index}
                  onClick={() => handleStatCardClick(stat)}
                  className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600/30 cursor-pointer hover:bg-slate-700/50 transition-all duration-200 hover:scale-105 flex items-center"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <StatIcon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <EyeIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Last Login</h3>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-3">Aktivitas 3 bulan terakhir akan tercatat</p>
            
            {/* BAGIAN YANG DIUBAH */}
            <div className="flex-grow">
              {lastLogin.map((login, i) => (
                <div key={i} className="flex items-start">
                  {/* Kolom Ikon dan Garis Vertikal */}
                  <div className="flex flex-col items-center mr-4">
                    <div className="bg-orange-400/20 p-1.5 rounded-full text-orange-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    {/* Garis vertikal, tidak ditampilkan untuk item terakhir */}
                    {i < lastLogin.length - 1 && (
                      <div className="w-px h-6 bg-slate-600 my-1"></div>
                    )}
                  </div>
                  {/* Kolom Teks dan Tanggal */}
                  <div className="flex-grow flex items-center justify-between pt-1">
                     <p className="font-medium text-white text-xs">{login.action}</p>
                     <p className="text-xs text-gray-400">{login.date}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-3">
              <button onClick={() => navigate('/history')} className="flex items-center justify-center w-full text-xs text-gray-400 hover:text-white transition-colors duration-200">
                Selengkapnya
                <ChevronDownIcon className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30">
        <div className="p-6 border-b border-slate-600/30">
          <div className="flex items-center space-x-2">
            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Recent History</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID CCTV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Error Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/30">
              {staticHistoryData.map((item) => (
                <tr key={item.id_history} className="hover:bg-slate-700/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">#{item.id_cctv}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.location_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.ip_address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(item.error_time)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
                      {item.status ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-600/30">
            <button onClick={() => navigate('/history')} className="flex items-center justify-center w-full text-xs text-gray-400 hover:text-white transition-colors duration-200">
                Selengkapnya
                <ChevronDownIcon className="w-3 h-3 ml-1" />
            </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const navigate = useNavigate();

  const handlePageChange = useCallback((pageId, path) => {
    console.log(`Navigating to: ${pageId} (${path})`);
    navigate(path);
  }, [navigate]);

  return (
    <MainLayout 
      Sidebar={(props) => (
        <Sidebar 
          {...props}
          onPageChange={handlePageChange}
        />
      )}
    >
      <DashboardContent 
        showSuccess={showSuccess}
        showError={showError}
        showWarning={showWarning}
        showInfo={showInfo}
        navigate={navigate}
      />
    </MainLayout>
  );
};

export default DashboardPage;