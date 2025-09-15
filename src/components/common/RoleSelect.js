// components/common/RoleSelect.js
import React, { memo } from 'react';

const RoleSelect = memo(({ value, onChange }) => {
  return (
    <select 
      value={value} 
      onChange={onChange} 
      className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">All Roles</option>
      <option value="SuperAdmin">Super Admin</option>
      <option value="Security">Security</option>
    </select>
  );
});

RoleSelect.displayName = 'RoleSelect';

export default RoleSelect;