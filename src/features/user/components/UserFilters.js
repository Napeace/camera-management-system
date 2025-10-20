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
            className="bg-white dark:bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-gray-300 dark:border-slate-700/50"
        >
            <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Cari User
                    </label>
                    <SearchInput
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Cari berdasarkan nama, username, atau NIP..."
                        disabled={loading}
                    />
                </div>
                <div className="w-full lg:w-48">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Role
                    </label>
                    <CustomRoleSelect
                        value={roleFilter}
                        onChange={onRoleChange}
                        disabled={loading}
                    />
                </div>
                {hasActiveFilters && (
                    <div className="w-full lg:w-auto">
                        <button
                            onClick={onClearFilters}
                            disabled={loading}
                            className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default UserFilters;