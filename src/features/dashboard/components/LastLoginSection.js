// src/features/dashboard/components/LastLoginSection.js
import React from 'react';
import { motion } from 'framer-motion';
import { KeyIcon, ChevronDownIcon, UsersIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * LastLoginSection Component
 * Menampilkan timeline login terakhir user
 * 
 * @param {Array} lastLoginData - Array of login records from API
 * @param {Function} onSeeMore - Handler untuk navigate ke halaman history
 */
const LastLoginSection = ({ lastLoginData = [], onSeeMore }) => {
    const loginData = lastLoginData;
    const hasData = loginData && loginData.length > 0;

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
            className="bg-white dark:bg-slate-900/70 rounded-xl border border-gray-200 dark:border-slate-600/30 p-4 flex flex-col h-full shadow-sm"
        >
            <div className="ml-3 flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                    <KeyIcon className="w-5 h-5 text-blue-700 dark:text-blue-600" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Last Login
                    </h3>
                </div>
            </div>
            <p className="ml-3 text-slate-700 dark:text-white text-xs mb-3">
                Aktivitas 3 bulan terakhir akan tercatat
            </p>

            {hasData ? (
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
                            <div className="mt-3 mr-3 ml-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                                {/* Kolom 1: Icon - fixed width */}
                                <div className="bg-orange-500/10 p-1.5 rounded-3xl">
                                    <UsersIcon className="w-7 h-7 fill-orange-500 stroke-slate-800/50 stroke-[1]" />
                                </div>

                                {/* Kolom 2: Text logged in - CENTER dengan background fit-content */}
                                <div className="flex justify-center">
                                    <div className="bg-orange-500/10 px-3 py-1.5 rounded-xl">
                                        <p className="font-medium text-dark dark:text-white text-xs text-center">
                                            {login.action}
                                        </p>
                                    </div>
                                </div>

                                {/* Kolom 3: Tanggal - auto width, align right */}
                                <div className="bg-orange-500/10 px-3 py-1.5 rounded-xl">
                                    <p className="text-xs text-dark dark:text-white whitespace-nowrap">
                                        {login.date}
                                    </p>
                                </div>
                            </div>

                            {/* Garis vertical - terpisah dari icon */}
                            {i < loginData.length - 1 && (
                                <div className="ml-4 flex pl-0.5 m-2">
                                    <div className="w-[28px] flex justify-center">
                                        <div className="w-px h-3 bg-gray-300 dark:bg-slate-600"></div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center py-8">
                    <ExclamationCircleIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Belum ada aktivitas login
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                        Data akan muncul setelah user melakukan login
                    </p>
                </div>
            )}

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