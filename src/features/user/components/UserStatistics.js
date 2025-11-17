import React from 'react';
import { motion } from 'framer-motion';
import StatCard, { StatCardWithAction } from '../../../components/common/StatCard';
import {
    UserGroupIcon,
    ShieldExclamationIcon,
    UserIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const UserStatistics = ({ statistics, loading, onAddUserClick, itemVariants }) => {
    return (
        <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4"
        >
            {/* Total Users - Full width on mobile/tablet, 1/4 on large screens */}
            <StatCard
                label="Total Users"
                value={String(statistics.total)}
                icon={UserGroupIcon}
                color="green"
                loading={loading}
                className="lg:col-span-1"
            />
            
            {/* Super Admins - Full width on mobile/tablet, 1/4 on large screens */}
            <StatCard
                label="Super Admins"
                value={String(statistics.superAdmins)}
                icon={ShieldExclamationIcon}
                color="purple"
                loading={loading}
                className="lg:col-span-1"
            />
            
            {/* Security Staff with Action - Full width on mobile/tablet, 2/4 on large screens */}
            <div className="lg:col-span-2">
                <StatCardWithAction
                    label="Security Staff"
                    value={String(statistics.security)}
                    icon={UserIcon}
                    buttonText="Tambah Pengguna"
                    buttonIcon={PlusIcon}
                    onButtonClick={onAddUserClick}
                    loading={loading}
                    color="blue"
                />
            </div>
        </motion.div>
    );
};

export default UserStatistics;