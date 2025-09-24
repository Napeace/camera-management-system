# Camera Management System (CMS)
## Perancangan dan Implementasi Sistem Pengelolaan dan Pemantauan Kamera Secara Terpusat di Rumah Sakit Citra Husada

### 📋 Deskripsi Proyek
Camera Management System (CMS) adalah sistem berbasis web yang dirancang khusus untuk Rumah Sakit Citra Husada dalam mengelola dan memantau 102 kamera CCTV yang tersebar di 8 titik strategis rumah sakit secara terpusat, real-time, dan efisien.

### 🎯 Tujuan
- Mempermudah pengelolaan dan pemantauan CCTV di Rumah Sakit Citra Husada
- Meningkatkan keamanan di rumah sakit melalui sistem pemantauan terpusat
- Mendukung efisiensi pengawasan CCTV melalui sistem yang terintegrasi dan real-time
- Digitalisasi sistem manajemen CCTV di rumah sakit

### 🌟 Fitur Utama

#### Super Admin
- ✅ Login/Logout sistem
- 🎥 **Manajemen CCTV**: Lihat, tambah, update, hapus CCTV
- 👥 **Manajemen Pengguna**: Menambah, lihat, update, hapus pengguna
- 📊 **History**: Melihat seluruh rekaman kamera CCTV
- ⚙️ **Setting**: Export/import data, backup data
- 🚨 **Notifikasi**: Menerima notifikasi kamera error

#### Security
- ✅ Login/Logout sistem  
- 🎥 **Monitoring**: Melihat CCTV dan tambah kamera baru
- 📊 **History**: Melihat history CCTV
- 🚨 **Notifikasi**: Menerima notifikasi kamera error

### 🏗️ Arsitektur Sistem
- **Frontend**: Web-based interface (Desktop focus)
- **Backend**: FastAPI dengan Python
- **Database**: PostgreSQL
- **Monitoring**: 102 kamera aktif di 8 titik lokasi
- **Akses**: 24/7 melalui jaringan internet

### 💻 Persyaratan Sistem

#### Hardware Requirements
- **Perangkat**: Komputer pribadi, laptop
- **RAM Minimum**: 4GB (optimal)
- **Koneksi Internet**: Stabil untuk streaming real-time
- **Penyimpanan**: Sesuai kebutuhan backup data

#### Software Requirements
- **Operating System**: 
  - Windows 7 (minimum)
  - macOS
  - Linux distributions
- **Web Browser** (versi terbaru):
  - Google Chrome ✅
  - Mozilla Firefox ✅  
  - Microsoft Edge ✅
  - Safari (Mac/iOS) ✅

#### Development Tools
- Visual Studio Code
- Postman
- PostgreSQL
- Figma
- Enterprise Architect
- ProjectLibre
- Data Modeler
- Power Designer
- Python

### 🚀 Instalasi & Setup

#### Prerequisites
```bash
# Pastikan Python terinstall
python --version

# Install PostgreSQL
# Download dari https://www.postgresql.org/
```

#### Development Setup
```bash
# Clone repository
git clone [repository-url]
cd camera-management-system

# Install dependencies
pip install -r requirements.txt

# Setup database
# Configure PostgreSQL connection

# Run application
python main.py
```

### 👥 Tim Pengembang (Kelompok CSM Universitas Jember)

| Nama | NIM | Role |
|------|-----|------|
| Mega Yassinta Aulia | 232410101031 | Scrum Master, Tester |
| Gresia Desvani Dharmawan | 232410102001 | System Analyst |
| Muhammad Najmi Nafis Zuhair | 232410101066 | Front End Developer |
| M. Satya Bintang Ramadhani | 232410102032 | Back End Developer |
| Ahimsa Jenar Bramsaifstyo Kusuma | 232410101090 | UI/UX Designer |

### 📁 Struktur Data

#### Input Data
- **User Data**: Username, Password
- **CCTV Data**: IP Address, Waktu, Lokasi

#### Output Data
- **Rekaman CCTV**: Video hasil rekaman dengan timestamp dan lokasi
- **Backup & Export**: Arsip rekaman dan log aktivitas
- **Notifikasi**: Status kamera error real-time
- **Laporan Aktivitas**: Riwayat login dan aktivitas pengguna

### 🔒 Keamanan
- Autentikasi user dengan login sistem
- Role-based access control (Super Admin vs Security)
- Protokol komunikasi aman (HTTPS/SSL)
- Perlindungan data rekaman CCTV
- Akses terbatas hanya untuk user yang tervalidasi

### ⚡ Performa
- **Real-time Monitoring**: Streaming 102 kamera simultan
- **24/7 Availability**: Sistem operasional sepanjang waktu
- **Response Time**: Notifikasi error < 2 menit
- **Kapasitas**: Mendukung 8 titik lokasi pemantauan

### 🧪 Testing & Quality Assurance
- **Functional Testing**: Pengujian semua fitur sesuai spesifikasi
- **Performance Testing**: Kecepatan akses dan stabilitas streaming
- **Security Testing**: Keamanan data dan sistem autentikasi
- **Usability Testing**: Kemudahan penggunaan interface

### 📈 Metodologi Pengembangan
Proyek ini menggunakan **Agile Scrum** methodology dengan tahapan:

1. **Sprint Planning**: Perencanaan fitur per sprint
2. **Development**: Implementasi fitur
3. **Testing**: Pengujian dan quality assurance  
4. **Review**: Evaluasi berkala dengan stakeholder
5. **Retrospective**: Perbaikan proses pengembangan

### 🔄 Development Phases

#### 1. Analisis Sistem
- Identifikasi kebutuhan bisnis
- Pengumpulan data melalui wawancara dan observasi
- Analisis proses pemantauan CCTV existing

#### 2. Perancangan
- Desain arsitektur sistem
- Database design
- UI/UX design
- System integration planning

#### 3. Implementasi
- Backend development (FastAPI + Python)
- Frontend development (Web-based)
- Database integration (PostgreSQL)
- CCTV system integration

#### 4. Testing & Evaluasi
- Unit testing
- Integration testing
- User acceptance testing
- Performance optimization

### 📋 Batasan Sistem
- Sistem berbasis web (akses melalui desktop)
- Membutuhkan koneksi internet stabil
- Terbatas pada 2 jenis user (Super Admin & Security)
- Fokus pada 102 kamera di 8 titik lokasi
- Ketergantungan pada infrastruktur listrik dan jaringan rumah sakit

### 📞 Support & Maintenance
- **Pemeliharaan Berkala**: Update sistem dan hardware
- **Technical Support**: Tim development tersedia untuk troubleshooting
- **Documentation**: Panduan penggunaan dan maintenance tersedia
- **Backup Strategy**: Sistem backup otomatis untuk data rekaman

### 📄 Dokumentasi
- Software Requirements Specification (SRS)
- User Manual
- Technical Documentation
- API Documentation (FastAPI)

### 🤝 Stakeholders
- **Rumah Sakit Citra Husada**: End user dan client
- **Kelompok CSM Universitas Jember**: Development team
- **Staff IT Rumah Sakit**: Super Admin users
- **Security Team**: Security users

### 📧 Kontak
Untuk informasi lebih lanjut mengenai proyek ini, silakan hubungi:
- **Project Team**: Kelompok CSM Universitas Jember
- **Institution**: Rumah Sakit Citra Husada, Jember

---

*Readme ini dibuat berdasarkan Software Requirements Specification (SRS) yang diterbitkan pada 2025-09-03*
