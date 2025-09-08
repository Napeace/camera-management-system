// Mock data untuk users (sudah disesuaikan dengan skema baru)
const mockUsers = [
  {
    id: 1,
    nama: "Dr. Ahmad Sutanto",
    nip: "198503152010011001",
    username: "ahmad_admin",
    role: { id: 1, name: "Super Admin" },
    created_at: "2024-01-15T10:30:00",
    status: "active"
  },
  {
    id: 2,
    nama: "Dr. Sarah Wijaya",
    nip: "198807222012032002",
    username: "sarah_admin",
    role: { id: 1, name: "Super Admin" },
    created_at: "2024-01-20T14:15:00",
    status: "active"
  },
  {
    id: 3,
    nama: "Nurse Maria Santos",
    nip: "199211302015052003",
    username: "maria_security",
    role: { id: 2, name: "Security" },
    created_at: "2024-02-01T09:00:00",
    status: "active"
  },
  {
    id: 4,
    nama: "Security Guard Budi",
    nip: "199001012014021005",
    username: "budi_security",
    role: { id: 2, name: "Security" },
    created_at: "2024-02-05T16:45:00",
    status: "active"
  },
  {
    id: 5,
    nama: "Admin Siti",
    nip: "199504182018092001",
    username: "siti_admin",
    role: { id: 1, name: "Super Admin" },
    created_at: "2024-02-10T11:20:00",
    status: "inactive"
  },
  {
    id: 6,
    nama: "Officer Joko",
    nip: "198908172013111009",
    username: "joko_security",
    role: { id: 2, name: "Security" },
    created_at: "2024-02-15T08:30:00",
    status: "active"
  }
];

// Simulasi delay API
const simulateApiDelay = (ms = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API functions
export const getAllUsers = async (filters = {}) => {
  await simulateApiDelay();
  
  let filteredUsers = [...mockUsers];
  
  // Filter by search term (sudah diupdate ke 'nama')
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.nama.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by role
  if (filters.role) {
    filteredUsers = filteredUsers.filter(user => 
      user.role.name === filters.role
    );
  }
  
  // Filter by status
  if (filters.status) {
    filteredUsers = filteredUsers.filter(user => 
      user.status === filters.status
    );
  }
  
  return {
    status: 'success',
    data: filteredUsers,
    total: filteredUsers.length
  };
};

export const getUserById = async (id) => {
  await simulateApiDelay();
  
  const user = mockUsers.find(user => user.id === parseInt(id));
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    status: 'success',
    data: user
  };
};

// Untuk development - nanti ganti dengan real API
/*
const API_BASE_URL = 'http://localhost:8000';

export const getAllUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE_URL}/api/users?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
};

export const getUserById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
};
*/