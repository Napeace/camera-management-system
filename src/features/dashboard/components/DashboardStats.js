// src/features/dashboard/components/DashboardStats.js
import React from 'react';
import { motion } from 'framer-motion';
import StatCard from '../../../components/common/StatCard';

/**
 * DashboardStats Component
 * Menampilkan stats cards dengan layout berbeda untuk SuperAdmin vs Security
 * 
 * @param {Array} stats - Array of stat objects dengan properties: label, value, Icon, color
 * @param {Boolean} loading - Loading state
 * @param {Boolean} isSuperAdmin - Apakah user SuperAdmin (untuk layout)
 * @param {Function} onStatClick - Handler untuk click event
 */
const DashboardStats = ({ stats, loading, isSuperAdmin, onStatClick }) => {
    return (
        <motion.div
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
            {isSuperAdmin ? (
                // SuperAdmin: 2x2 Grid (4 cards)
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                onClick={() => onStatClick(stat)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                // Security: Total Kamera full width on top, Online/Offline below in 2 columns
                <motion.div className="space-y-4">
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
                            onClick={() => onStatClick(stats[0])}
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
                                onClick={() => onStatClick(stats[1])}
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
                                onClick={() => onStatClick(stats[2])}
                            />
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default DashboardStats;