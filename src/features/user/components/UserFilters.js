import React from 'react';
import { motion } from 'framer-motion';
import SearchInput from '../../../components/common/SearchInput';
import CustomRoleSelect from '../../../components/common/CustomRoleSelect';

const UserFilters = ({
    searchTerm,
    roleFilter,
    loading,
    hasActiveFilters,
    onSearchChange,
    onRoleChange,
    onClearFilters,
    itemVariants
}) => {
    return (
        <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900/70 backdrop-blur-sm p-4 lg:p-6 rounded-xl border border-gray-300 dark:border-slate-700/50"
        >
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-end">
                {/* Search Input - Full width on mobile, flex-1 on desktop */}
                <div className="flex-1 min-w-0">
                    <label className="block text-xs lg:text-sm font-medium mb-1.5 lg:mb-2 text-gray-700 dark:text-gray-300">
                        Cari User
                    </label>
                    <SearchInput
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Cari berdasarkan nama, username, atau NIP..."
                        disabled={loading}
                    />
                </div>
                
                {/* Role Select - Full width on mobile, fixed width on desktop */}
                <div className="w-full lg:w-48 xl:w-56">
                    <label className="block text-xs lg:text-sm font-medium mb-1.5 lg:mb-2 text-gray-700 dark:text-gray-300">
                        Role
                    </label>
                    <CustomRoleSelect
                        value={roleFilter}
                        onChange={onRoleChange}
                        disabled={loading}
                    />
                </div>
                
                {/* Clear Button - Full width on mobile, auto width on desktop */}
                {hasActiveFilters && (
                    <div className="w-full lg:w-auto">
                        <button
                            onClick={onClearFilters}
                            disabled={loading}
                            className="w-full lg:w-auto bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-gray-800 dark:text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-medium transition-colors duration-200 text-xs lg:text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default UserFilters;