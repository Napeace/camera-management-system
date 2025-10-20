// src/features/dashboard/components/LastLoginSection.js
import React from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * LastLoginSection Component
 * Menampilkan timeline login terakhir user
 * 
 * @param {Array} lastLoginData - Array of login records (default: static data 3 records)
 * @param {Function} onSeeMore - Handler untuk navigate ke halaman history
 */
const LastLoginSection = ({ lastLoginData, onSeeMore }) => {
    // Static data untuk demo (nanti bisa diganti dengan data dari API)
    const defaultLoginData = [
        { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
        { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
        { user: 'Admin RSCH', date: '19 September 2025', action: 'Logged in: Admin RSCH' },
    ];

    const loginData = lastLoginData || defaultLoginData;

    return (
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
                {loginData.map((login, i) => (
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
                            {i < loginData.length - 1 && (
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
                    onClick={onSeeMore}
                    className="flex items-center justify-center w-full text-xs text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                >
                    Selengkapnya
                    <ChevronDownIcon className="w-3 h-3 ml-1" />
                </button>
            </div>
        </motion.div>
    );
};

export default LastLoginSection;