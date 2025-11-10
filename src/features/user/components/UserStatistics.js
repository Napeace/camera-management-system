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
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
            <StatCard
                label="Total Users"
                value={String(statistics.total)}
                icon={UserGroupIcon}
                color="green"
                loading={loading}
            />
            <StatCard
                label="Super Admins"
                value={String(statistics.superAdmins)}
                icon={ShieldExclamationIcon}
                color="purple"
                loading={loading}
            />
            <div className="md:col-span-2">
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