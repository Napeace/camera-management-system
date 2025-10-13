// pages/DashboardPage.js - REFACTORED dengan AnimatedSection + Custom Hooks untuk Exit Animation
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/common/StatCard';
import AnimatedSection from '../components/common/AnimatedSection';
import cctvService from '../services/cctvService';
import userService from '../services/userService';
import useStaggerAnimation from '../hooks/useStaggerAnimation';
import useTableAnimation from '../hooks/useTableAnimation';
import { staggerContainer, fadeInUp } from '../utils/animationVariants';
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

const DashboardContent = ({
    stats,
    loading,
    showSuccess,
    showInfo,
    showError,
    showWarning,
    navigate,
    isSuperAdmin,
}) => {
    // ✅ Keep custom hooks for proper exit animations
    const animations = useStaggerAnimation({
        staggerDelay: 0.15,
        initialDelay: 0.1,
        duration: 0.5,
        yOffset: 30
    });

    const tableAnimations = useTableAnimation({
        staggerDelay: 0.08,
        duration: 0.4,
        enableHover: false, // Disable hover to prevent scroll issues
        yOffset: 20
    });

    const lastLogin = [
        { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
        { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
        { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
    ];

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

    const staticHistoryData = [
        { id_history: 1, id_cctv: 1, ip_address: '192.168.1.101', location_name: 'Lobby Utama', error_time: '2024-01-15T10:30:00Z', status: false },
        { id_history: 2, id_cctv: 2, ip_address: '192.168.1.102', location_name: 'Ruang Server', error_time: '2024-01-15T09:15:00Z', status: false },
        { id_history: 3, id_cctv: 3, ip_address: '192.168.1.103', location_name: 'Parkiran Depan', error_time: '2024-01-14T16:45:00Z', status: true },
        { id_history: 4, id_cctv: 4, ip_address: '192.168.1.104', location_name: 'Koridor Lantai 2', error_time: '2024-01-14T14:20:00Z', status: false },
    ];

    return (
        <motion.div
            className="space-y-6"
            variants={animations.container}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Top Grid: Stats Cards (left) + Last Login (right) */}
            <motion.div
                variants={animations.item}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Left Side: Stats Cards */}
                {isSuperAdmin ? (
                    // SuperAdmin: 2x2 Grid (4 cards)
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.15
                                }
                            },
                            exit: {
                                opacity: 0,
                                transition: {
                                    staggerChildren: 0.05,
                                    staggerDirection: -1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            duration: 0.4,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: -20,
                                        transition: {
                                            duration: 0.3,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    }
                                }}
                            >
                                <StatCard
                                    label={stat.label}
                                    value={stat.value}
                                    icon={stat.Icon}
                                    color={stat.color}
                                    loading={loading}
                                    onClick={() => handleStatCardClick(stat)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    // Security: Total Kamera full width on top, Online/Offline below in 2 columns
                    <motion.div
                        className="space-y-4"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.15,
                                    delayChildren: 0.15
                                }
                            },
                            exit: {
                                opacity: 0,
                                transition: {
                                    staggerChildren: 0.05,
                                    staggerDirection: -1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Total Kamera - Full Width */}
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.4,
                                        ease: [0.4, 0, 0.2, 1]
                                    }
                                },
                                exit: {
                                    opacity: 0,
                                    y: -20,
                                    transition: {
                                        duration: 0.3,
                                        ease: [0.4, 0, 0.2, 1]
                                    }
                                }
                            }}
                        >
                            <StatCard
                                label={stats[0].label}
                                value={stats[0].value}
                                icon={stats[0].Icon}
                                color={stats[0].color}
                                loading={loading}
                                onClick={() => handleStatCardClick(stats[0])}
                            />
                        </motion.div>

                        {/* Online & Offline - Side by Side */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                },
                                exit: {
                                    opacity: 0,
                                    transition: {
                                        staggerChildren: 0.05,
                                        staggerDirection: -1
                                    }
                                }
                            }}
                        >
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            duration: 0.4,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: -20,
                                        transition: {
                                            duration: 0.3,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    }
                                }}
                            >
                                <StatCard
                                    label={stats[1].label}
                                    value={stats[1].value}
                                    icon={stats[1].Icon}
                                    color={stats[1].color}
                                    loading={loading}
                                    onClick={() => handleStatCardClick(stats[1])}
                                />
                            </motion.div>
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            duration: 0.4,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: -20,
                                        transition: {
                                            duration: 0.3,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    }
                                }}
                            >
                                <StatCard
                                    label={stats[2].label}
                                    value={stats[2].value}
                                    icon={stats[2].Icon}
                                    color={stats[2].color}
                                    loading={loading}
                                    onClick={() => handleStatCardClick(stats[2])}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Right Side: Last Login */}
                <motion.div
                    variants={animations.item}
                    className="bg-white dark:bg-slate-950/50 rounded-xl border border-gray-200 dark:border-slate-600/30 p-4 flex flex-col h-full shadow-sm"
                >
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                            <EyeIcon className="w-5 h-5 text-blue-400" />
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                Last Login
                            </h3>
                        </div>
                    </div>
                    <p className="text-slate-700 dark:text-white text-xs mb-3">
                        Aktivitas 3 bulan terakhir akan tercatat
                    </p>

                    <motion.div
                        className="flex-grow"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.3
                                }
                            },
                            exit: {
                                opacity: 0,
                                transition: {
                                    staggerChildren: 0.05,
                                    staggerDirection: -1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {lastLogin.map((login, i) => (
                            <motion.div
                                key={i}
                                className="flex items-start"
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: {
                                        opacity: 1,
                                        x: 0,
                                        transition: {
                                            duration: 0.3,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    },
                                    exit: {
                                        opacity: 0,
                                        x: -20,
                                        transition: {
                                            duration: 0.2,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    }
                                }}
                            >
                                <div className="flex flex-col items-center mr-4">
                                    <div className="bg-orange-400/20 p-1.5 rounded-full text-orange-400">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    {i < lastLogin.length - 1 && (
                                        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 my-1"></div>
                                    )}
                                </div>
                                <div className="flex-grow flex items-center justify-between pt-1">
                                    <p className="font-medium text-slate-900 dark:text-white text-xs">
                                        {login.action}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{login.date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="pt-3">
                        <button
                            onClick={() => navigate('/history')}
                            className="flex items-center justify-center w-full text-xs text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                        >
                            Selengkapnya
                            <ChevronDownIcon className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom: Recent History Table - ✅ With proper exit animation */}
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                    opacity: 1, 
                    height: "auto",
                    transition: {
                        opacity: { duration: 0.5, delay: 0.5 },
                        height: { duration: 0.6, delay: 0.5 },
                        ease: [0.4, 0, 0.2, 1]
                    }
                }}
                exit={{ 
                    opacity: 0, 
                    height: 0,
                    transition: {
                        opacity: { duration: 0.3 },
                        height: { duration: 0.4 },
                        ease: [0.4, 0, 0.2, 1]
                    }
                }}
                className="bg-white dark:bg-slate-950/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-600/30 shadow-sm flex flex-col overflow-hidden"
            >
                <div className="p-4 border-b border-gray-200 dark:border-slate-600/30">
                    <div className="flex items-center space-x-2">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-blue-400" />
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            Recent History
                        </h3>
                    </div>
                </div>
                <div className="overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-900/20 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                    Location
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <motion.tbody
                            className="divide-y divide-gray-200 dark:divide-slate-600/30"
                            variants={tableAnimations.tbody}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            {staticHistoryData.slice(0, 4).map((item) => (
                                <motion.tr
                                    key={item.id_history}
                                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                                    variants={tableAnimations.row}
                                >
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.location_name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                            }`}
                                        >
                                            {item.status ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-slate-600/30">
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center justify-center w-full text-xs text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                    >
                        Selengkapnya
                        <ChevronDownIcon className="w-3 h-3 ml-1" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const navigate = useNavigate();

    const [cctvData, setCctvData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const contentRef = useRef(null);

    const isSuperAdmin = user?.role === 'superadmin';

    const extractErrorMessage = (err) => {
        if (err?.response?.data?.message) return err.response.data.message;
        if (err?.response?.data?.detail) return err.response.data.detail;
        if (err?.message) return err.message;
        return 'An unexpected error occurred.';
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const cctvResult = await cctvService.getAllCCTV();
            setCctvData(cctvResult.data || []);

            if (isSuperAdmin) {
                try {
                    const userResult = await userService.getAllUsers();
                    setUserData(userResult.data || []);
                } catch (userErr) {
                    console.warn('Failed to fetch user data:', userErr);
                    setUserData([]);
                }
            } else {
                setUserData([]);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            const errorMessage = extractErrorMessage(err);
            setError(errorMessage);
            showError('Load Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [showError, isSuperAdmin]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        if (contentRef.current && !loading) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [loading]);

    const stats = useMemo(() => {
        const totalCameras = cctvData.length;
        const onlineCameras = cctvData.filter((cctv) => cctv.is_streaming === true).length;
        const offlineCameras = totalCameras - onlineCameras;
        const totalUsers = userData.length;

        const baseStats = [
            {
                label: 'Total Kamera',
                value: String(totalCameras),
                Icon: VideoCameraIcon,
                color: 'blue',
            },
            {
                label: 'Online Kamera',
                value: String(onlineCameras),
                Icon: SignalIcon,
                color: 'green',
            },
            {
                label: 'Offline Kamera',
                value: String(offlineCameras),
                Icon: SignalSlashIcon,
                color: 'red',
            },
        ];

        if (isSuperAdmin) {
            return [
                baseStats[0],
                {
                    label: 'Total Pengguna',
                    value: String(totalUsers),
                    Icon: UserGroupIcon,
                    color: 'purple',
                },
                baseStats[1],
                baseStats[2],
            ];
        }

        return baseStats;
    }, [cctvData, userData, isSuperAdmin]);

    const handlePageChange = useCallback(
        (pageId, path) => {
            console.log(`Navigating to: ${pageId} (${path})`);
            navigate(path);
        },
        [navigate]
    );

    return (
        <MainLayout
            Sidebar={(props) => <Sidebar {...props} onPageChange={handlePageChange} />}
        >
            <div ref={contentRef}>
                <DashboardContent
                    stats={stats}
                    loading={loading}
                    showSuccess={showSuccess}
                    showError={showError}
                    showWarning={showWarning}
                    showInfo={showInfo}
                    navigate={navigate}
                    isSuperAdmin={isSuperAdmin}
                />
            </div>
        </MainLayout>
    );
};

export default DashboardPage;