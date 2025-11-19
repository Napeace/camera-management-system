import React from 'react';
import CCTVCreateModal from './CCTVCreateModal';
import CCTVEditModal from './CCTVEditModal';
import LocationManagementModal from './LocationManagementModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const CCTVModals = ({
    showCreateModal,
    showEditModal,
    showLocationModal,
    editingCCTV,
    locationGroups,
    confirmDialog,
    onModalClose,
    onCCTVCreated,
    onCCTVUpdated,
    onLocationCreated,
    onConfirmAction,
    onCloseConfirmDialog
}) => {
    return (
        <>
            <CCTVCreateModal 
                isOpen={showCreateModal} 
                onClose={onModalClose} 
                onCCTVCreated={onCCTVCreated} 
                locationGroups={locationGroups} 
            />
            <CCTVEditModal 
                isOpen={showEditModal} 
                onClose={onModalClose} 
                cctvToEdit={editingCCTV} 
                onCCTVUpdated={onCCTVUpdated} 
                locationGroups={locationGroups} 
            />
            <LocationManagementModal
                isOpen={showLocationModal}
                onClose={onModalClose}
                onLocationCreated={onLocationCreated}
            />
            <ConfirmDialog 
                isOpen={confirmDialog.isOpen} 
                onClose={onCloseConfirmDialog} 
                onConfirm={onConfirmAction} 
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText || 'Iya'}
                cancelText={confirmDialog.cancelText || 'Tidak'}
                type={confirmDialog.type}
                loading={confirmDialog.loading}
            />
        </>
    );
};

export default CCTVModals;