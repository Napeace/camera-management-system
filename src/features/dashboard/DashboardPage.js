// src/features/dashboard/DashboardPage.js 
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';

// Custom Hooks
import useDashboardData from './hooks/useDasboardData';
import useCCTVStats from '../../hooks/useCCTVStats';
import useUserStats from '../../hooks/useUserStats';
import useStaggerAnimation from '../../hooks/useStaggerAnimation';

// Dashboard Components
import DashboardStats from './components/DashboardStats';
import LastLoginSection from './components/LastLoginSection';
import OfflineHistoryChart from './components/OfflineHistoryChart';
import RecentHistoryTable from './components/RecentHistoryTable';

// Icons
import {
    VideoCameraIcon,
    UserGroupIcon,
    SignalIcon,
    SignalSlashIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
    const { user } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const navigate = useNavigate();

    const contentRef = useRef(null);
    const isSuperAdmin = user?.role === 'superadmin';

    // Animation setup
    const animations = useStaggerAnimation({
        staggerDelay: 0.15,
        initialDelay: 0.1,
        duration: 0.5,
        yOffset: 30
    });

    // Fetch dashboard data using custom hook
    const { cctvData, userData, lastLoginData, loading, error } = useDashboardData({
        showError,
        isSuperAdmin
    });

    // Calculate statistics using custom hooks
    const cctvStats = useCCTVStats(cctvData);
    const userStats = useUserStats(userData);

    // Scroll to top when loading completes
    useEffect(() => {
        if (contentRef.current && !loading) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [loading]);

    // Combine stats based on user role
    const stats = useMemo(() => {
        if (isSuperAdmin) {
            // SuperAdmin: 4 cards (Total Kamera, Total Pengguna, Online, Offline)
            return [
                {
                    label: 'Total Kamera',
                    value: String(cctvStats.total),
                    Icon: VideoCameraIcon,
                    color: 'blue',
                },
                {
                    label: 'Total Pengguna',
                    value: String(userStats.total),
                    Icon: UserGroupIcon,
                    color: 'purple',
                },
                {
                    label: 'Online Kamera',
                    value: String(cctvStats.online),
                    Icon: SignalIcon,
                    color: 'green',
                },
                {
                    label: 'Offline Kamera',
                    value: String(cctvStats.offline),
                    Icon: SignalSlashIcon,
                    color: 'red',
                },
            ];
        } else {
            // Security: 2 cards only (Total Kamera, Online Kamera)
            return [
                {
                    label: 'Total Kamera',
                    value: String(cctvStats.total),
                    Icon: VideoCameraIcon,
                    color: 'blue',
                },
                {
                    label: 'Online Kamera',
                    value: String(cctvStats.online),
                    Icon: SignalIcon,
                    color: 'green',
                },
            ];
        }
    }, [cctvStats, userStats, isSuperAdmin]);

    // Handle stat card click
    const handleStatCardClick = useCallback(
        (statData) => {
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
        },
        [showInfo, showSuccess, showWarning]
    );

    // Handle page navigation
    const handlePageChange = useCallback(
        (pageId, path) => {
            console.log(`Navigating to: ${pageId} (${path})`);
            navigate(path);
        },
        [navigate]
    );

    // Handle see more clicks
    const handleSeeMoreHistory = useCallback(() => {
        navigate('/history');
    }, [navigate]);

    // Handle see more clicks
    const handleSeeMoreLastLogin = useCallback(() => {
        navigate('/users');
    }, [navigate]);

    return (
        <MainLayout
            Sidebar={(props) => <Sidebar {...props} onPageChange={handlePageChange} />}
        >
            <div ref={contentRef}>
                <motion.div
                    className="space-y-6"
                    variants={animations.container}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Top Grid: Stats Cards (left) + Last Login/Offline Chart (right) */}
                    <motion.div
                        variants={animations.item}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Left Side: Stats Cards */}
                        <DashboardStats
                            stats={stats}
                            loading={loading}
                            isSuperAdmin={isSuperAdmin}
                            onStatClick={handleStatCardClick}
                        />

                        {/* Right Side: Conditional - Last Login (SuperAdmin) or Offline Chart (Security) */}
                        {isSuperAdmin ? (
                            <LastLoginSection
                                lastLoginData={lastLoginData}
                                onSeeMore={handleSeeMoreLastLogin}
                            />
                        ) : (
                            <OfflineHistoryChart />
                        )}
                    </motion.div>

                    {/* Bottom: Recent History Table */}
                    <motion.div variants={animations.item}>
                        <RecentHistoryTable
                            loading={loading}
                            onSeeMore={handleSeeMoreHistory}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </MainLayout>
    );
};

export default DashboardPage;