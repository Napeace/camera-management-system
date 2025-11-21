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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            {/* Online Kamera - Full width on mobile/tablet, 1/4 on large screens */}
            <StatCard 
                label="Online Kamera" 
                value={String(statistics.online)}
                icon={SignalIcon}
                color="green"
                loading={loading}
                className="lg:col-span-1"
            />
            
            {/* Offline Kamera - Full width on mobile/tablet, 1/4 on large screens */}
            <StatCard 
                label="Offline Kamera" 
                value={String(statistics.offline)}
                icon={SignalSlashIcon}
                color="red"
                loading={loading}
                className="lg:col-span-1"
            />
            
            {/* Total Kamera with Actions - Full width on mobile/tablet, 2/4 on large screens */}
            <div className="lg:col-span-2">
                <StatCardWithMultipleActions 
                    label="Total Kamera" 
                    value={String(statistics.total)}
                    icon={VideoCameraIcon}
                    primaryButton={isSuperAdmin ? {
                        text: 'Tambah Kamera',
                        icon: PlusIcon,
                        onClick: onAddCCTV
                    } : null}
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