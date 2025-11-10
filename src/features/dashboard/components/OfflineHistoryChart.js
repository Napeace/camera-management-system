// src/features/dashboard/components/OfflineHistoryChart.js
import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SignalSlashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../contexts/ThemeContext';
import useOfflineChartData from '../hooks/useOfflineChartData';

/**
 * OfflineHistoryChart Component
 * Menampilkan grafik line chart untuk kamera offline 7 hari terakhir (Security role only)
 * Mendukung dark mode dan light mode
 * Data diambil secara dinamis dari database (tabel history)
 */
const OfflineHistoryChart = () => {
    const { isDarkMode } = useTheme();
    const { chartData, loading, error, refetch } = useOfflineChartData();

    // Theme-aware colors
    const colors = {
        border: isDarkMode ? 'border-red-500/70' : 'border-red-400/60',
        background: isDarkMode 
            ? 'bg-[linear-gradient(to_bottom_right,theme(colors.slate.900/.8),theme(colors.slate.950/.8)),linear-gradient(to_left,theme(colors.red.500/.9),transparent)]'
            : 'bg-[linear-gradient(to_bottom_right,theme(colors.white/.9),theme(colors.gray.50/.9)),linear-gradient(to_left,theme(colors.red.400/.15),transparent)]',
        icon: isDarkMode ? 'text-red-500' : 'text-red-600',
        title: isDarkMode ? 'text-white' : 'text-gray-900',
        subtitle: isDarkMode ? 'text-white/20' : 'text-gray-400',
        tooltipBg: isDarkMode ? 'bg-slate-900/95' : 'bg-white/95',
        tooltipBorder: isDarkMode ? 'border-red-500/50' : 'border-red-400/50',
        tooltipText: isDarkMode ? 'text-red-400' : 'text-red-600',
        tooltipSubtext: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        gridStroke: isDarkMode ? '#334155' : '#e2e8f0',
        axisStroke: isDarkMode ? '#64748b' : '#94a3b8',
        axisTick: isDarkMode ? '#94a3b8' : '#64748b',
        axisLine: isDarkMode ? '#334155' : '#cbd5e1',
        cursorStroke: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
        lineStroke: isDarkMode ? '#ef4444' : '#dc2626',
        dotFill: isDarkMode ? '#ef4444' : '#dc2626',
        loadingText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        errorText: isDarkMode ? 'text-red-400' : 'text-red-600',
    };

    // Custom Tooltip dengan dynamic label (Hari ini, Kemarin, dst)
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            const index = chartData.findIndex(d => d.date === dataPoint.date);
            const daysAgo = chartData.length - 1 - index;

            let label = '';
            if (daysAgo === 0) label = 'Hari ini';
            else if (daysAgo === 1) label = 'Kemarin';
            else label = `${daysAgo} hari lalu`;

            return (
                <div className={`${colors.tooltipBg} backdrop-blur-sm border ${colors.tooltipBorder} rounded-lg px-3 py-2 shadow-xl`}>
                    <p className={`${colors.tooltipText} font-semibold text-sm`}>
                        {label}: {payload[0].value}
                    </p>
                    <p className={`${colors.tooltipSubtext} text-xs mt-1`}>
                        {dataPoint.fullDate}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Get current month and year from chartData
    const getCurrentPeriod = () => {
        if (chartData && chartData.length > 0) {
            return chartData[chartData.length - 1].fullDate.split(' ').slice(1).join(' ');
        }
        const now = new Date();
        return now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

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
            className={`relative rounded-xl border ${colors.border} p-4 flex flex-col h-full ${colors.background} transition-all duration-200 hover:scale-105 
                shadow-lg hover:shadow-2xl 
                dark:shadow-slate-900/50 dark:hover:shadow-slate-900/80`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <SignalSlashIcon className={`w-5 h-5 ${colors.icon}`} />
                    <h3 className={`text-base font-semibold ${colors.title}`}>
                        Grafik Kamera Offline
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="rounded-lg px-3 py-1">
                        <p className={`${colors.subtitle} text-sm`}>
                            {getCurrentPeriod()}
                        </p>
                    </div>
                    {!loading && (
                        <button
                            onClick={refetch}
                            className={`p-1.5 rounded-lg ${colors.icon} hover:bg-red-500/10 transition-colors`}
                            title="Refresh data"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Chart Container */}
            <motion.div
                className="flex-grow min-h-[250px] flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {loading ? (
                    // Loading State
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                        <p className={`${colors.loadingText} text-sm`}>Memuat data...</p>
                    </div>
                ) : error ? (
                    // Error State
                    <div className="flex flex-col items-center justify-center gap-2 text-center px-4">
                        <SignalSlashIcon className={`w-12 h-12 ${colors.errorText} opacity-50`} />
                        <p className={`${colors.errorText} text-sm font-medium`}>Gagal memuat data</p>
                        <p className={`${colors.loadingText} text-xs`}>{error}</p>
                        <button
                            onClick={refetch}
                            className={`mt-2 px-3 py-1.5 rounded-lg ${colors.icon} bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm`}
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : chartData.length === 0 ? (
                    // No Data State
                    <div className="flex flex-col items-center justify-center gap-2">
                        <SignalSlashIcon className={`w-12 h-12 ${colors.loadingText} opacity-50`} />
                        <p className={`${colors.loadingText} text-sm`}>Tidak ada data tersedia</p>
                    </div>
                ) : (
                    // Chart
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            {/* Gradient Definition untuk Area - Shadow dengan adaptasi tema */}
                            <defs>
                                <linearGradient id="shadowGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop 
                                        offset="0%" 
                                        stopColor={isDarkMode ? "#000000" : "#ef4444"} 
                                        stopOpacity={isDarkMode ? 0.6 : 0.3} 
                                    />
                                    <stop 
                                        offset="50%" 
                                        stopColor={isDarkMode ? "#000000" : "#ef4444"} 
                                        stopOpacity={isDarkMode ? 0.3 : 0.15} 
                                    />
                                    <stop 
                                        offset="100%" 
                                        stopColor={isDarkMode ? "#000000" : "#ef4444"} 
                                        stopOpacity={0} 
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={colors.gridStroke}
                                opacity={0.2}
                            />
                            <XAxis
                                dataKey="date"
                                stroke={colors.axisStroke}
                                tick={{ fill: colors.axisTick, fontSize: 12 }}
                                axisLine={{ stroke: colors.axisLine }}
                            />
                            <YAxis
                                stroke={colors.axisStroke}
                                tick={{ fill: colors.axisTick, fontSize: 12 }}
                                axisLine={{ stroke: colors.axisLine }}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: colors.cursorStroke, strokeWidth: 2 }}
                            />
                            
                            {/* Area dengan gradient (shadow effect atau colored area) */}
                            <Area
                                type="stepBefore"
                                dataKey="offline"
                                fill="url(#shadowGradient)"
                                stroke="none"
                                fillOpacity={1}
                                animationDuration={800}
                                animationEasing="ease-out"
                            />
                            
                            {/* Line Chart merah di atas area */}
                            <Line
                                type="stepBefore"
                                dataKey="offline"
                                stroke={colors.lineStroke}
                                strokeWidth={4}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                dot={(props) => {
                                    const { cx, cy, index } = props;
                                    if (index === 0) return null;
                                    
                                    return (
                                        <rect
                                            x={cx - 6}
                                            y={cy - 6}
                                            width={12}
                                            height={12}
                                            rx={3}
                                            ry={3}
                                            fill={colors.dotFill}
                                        />
                                    );
                                }}
                                activeDot={(props) => {
                                    const { cx, cy } = props;
                                    return (
                                        <rect
                                            x={cx - 8}
                                            y={cy - 8}
                                            width={16}
                                            height={16}
                                            rx={4}
                                            ry={4}
                                            fill={colors.dotFill}
                                        />
                                    );
                                }}
                                animationDuration={800}
                                animationEasing="ease-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </motion.div>
        </motion.div>
    );
};

export default OfflineHistoryChart;