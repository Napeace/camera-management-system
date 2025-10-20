import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import StatCard, { StatCardWithMultipleActions } from '../../../components/common/StatCard';
import { 
    PlusIcon, 
    VideoCameraIcon, 
    SignalIcon, 
    SignalSlashIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

const CCTVStatistics = ({ 
    statistics, 
    loading, 
    onAddCCTV, 
    onManageLocations 
}) => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'superadmin';

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
                label="Online Kamera" 
                value={String(statistics.online)}
                icon={SignalIcon}
                color="green"
                loading={loading}
            />
            <StatCard 
                label="Offline Kamera" 
                value={String(statistics.offline)}
                icon={SignalSlashIcon}
                color="red"
                loading={loading}
            />
            <div className="md:col-span-2">
                <StatCardWithMultipleActions 
                    label="Total Kamera" 
                    value={String(statistics.total)}
                    icon={VideoCameraIcon}
                    primaryButton={{
                        text: 'Tambah Kamera',
                        icon: PlusIcon,
                        onClick: onAddCCTV
                    }}
                    secondaryButton={isSuperAdmin ? {
                        text: 'Kelola Lokasi',
                        icon: MapPinIcon,
                        onClick: onManageLocations
                    } : null}
                    loading={loading}
                    color="blue"
                />
            </div>
        </div>
    );
};

export default CCTVStatistics;