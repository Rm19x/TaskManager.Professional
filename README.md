# Task Manager Professional 2026

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Developer](https://img.shields.io/badge/Developer-Mr.Rm19-00ffcc)](https://github.com/Rm19x)

**Task Manager Professional 2026** adalah aplikasi pemantau sistem berbasis web ringkas yang dirancang khusus untuk lingkungan Windows. Aplikasi ini menggunakan arsitektur **Node.js (Backend)** sebagai jembatan sistem dan **HTML5/CSS3/JavaScript (Frontend)** dengan tema *dark mode cyber* yang futuristik untuk memantau performa, proses, dan layanan komputer Anda secara real-time.

---

##  Fitur Utama

* **Dashboard Status Sistem Dinamis**: Memantau Informasi OS, Model CPU, Penggunaan RAM (*used vs total*), Sisa Kapasitas Penyimpanan Drive C:, dan *System Uptime* secara berkala setiap 5 detik.
* **Manajemen Proses Windows (A-Z)**: Menampilkan seluruh proses aktif yang terurut rapi, lengkap dengan PID dan pencarian/filter instan.
* **Sistem Proteksi BSOD**: Dilengkapi pengaman internal untuk mencegah penghentian tidak sengaja pada proses vital sistem seperti `explorer.exe`, `svchost.exe`, `lsass.exe`, dan `services.exe`.
* **Bulk Kill Task**: Kemampuan untuk memilih beberapa proses sekaligus (*multi-select*) dan menghentikannya secara massal.
* **Windows Services Monitor**: Tab khusus untuk melihat daftar layanan Windows (Services) yang sedang berjalan aktif di latar belakang (dibatasi 50 entri teratas demi performa).
* **One-Click RAM Cleaner**: Simulasi optimasi pembersihan cache RAM secara instan.
* **Ekspor Log Komprehensif**: Fitur mencetak daftar proses aktif saat ini ke dalam file `.txt` langsung ke Desktop Anda dengan format laporan yang rapi.
* **Mini Quick CMD Console**: Eksekusi perintah CMD (seperti `ping`, `ipconfig`, dll) langsung dari antarmuka web, yang akan membuka jendela Command Prompt baru secara mandiri.

---

##  Arsitektur & Teknologi

Aplikasi ini bekerja menggunakan mekanisme jembatan lokal (*Local Bridge*):
1.  **Backend (`server.js`)**: Berjalan di Node.js menggunakan modul bawaan (`http`, `child_process`, `fs`, `os`). Backend mengeksekusi perintah Windows CLI asli (seperti `tasklist`, `wmic`, `sc query`, `taskkill`) lalu mengubah outputnya menjadi format JSON API.
2.  **Frontend (`taskmanager.html`)**: Mengonsumsi REST API dari backend menggunakan metode `fetch()` modern dan merendernya ke tampilan UI *cyberpunk-neon*.

---

##  Persyaratan Sistem

* **Sistem Operasi**: Windows 10 / 11 / Server (Karena ketergantungan pada command CLI Windows).
* **Runtime**: Node.js versi 18.x atau yang lebih baru.
* **Browser**: Google Chrome, Microsoft Edge, atau browser berbasis Chromium lainnya.

---

##  Panduan Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk menjalankan projek di komputer lokal Anda:

```
node server.js
Jika berhasil, konsol akan menampilkan pesan:
Backend Jembatan Sistem Berjalan di http://localhost:3000
3. Buka Antarmuka Web (Frontend)

Buka file taskmanager.html secara langsung dengan melakukan double-click pada file tersebut, ATAU

Gunakan ekstensi seperti Live Server di VS Code untuk membukanya di browser.
```
## info
* Melihat Informasi Komputer: Saat pertama kali dibuka, panel atas akan otomatis terisi spesifikasi komputer Anda. Status RAM dan Uptime akan terus diperbarui secara otomatis di latar belakang.

* Mencari Proses: Ketik nama proses yang ingin Anda cari pada kolom “Ketik untuk memfilter proses secara instan...”. Tabel akan menyaring data secara real-time saat Anda mengetik.

* Menghentikan Proses (End Task):

* Single: Klik tombol merah End Task di baris proses spesifik.

* Massal: Centang kotak di sebelah kiri pada beberapa proses yang diinginkan, lalu klik tombol BUNUH TERPILIH di bagian atas.

* Ekspor Data: Klik tombol EKSPOR LOG (warna ungu), aplikasi akan membuat file bernama MrRm19_Process_Log.txt di Desktop Anda.

* Menjalankan Perintah CMD: Ketik perintah Windows CMD pada kolom QUICK CMD CONSOLE di bagian bawah (contoh: ipconfig), lalu klik RUN. Sebuah jendela Command Prompt baru akan muncul mengeksekusi perintah tersebut.
* Hak Akses: Beberapa proses sistem atau layanan pihak ketiga (seperti Antivirus) memerlukan hak akses Administrator untuk dihentikan. Jika server Node.js tidak berjalan sebagai Administrator, perintah taskkill untuk proses-proses tersebut akan menghasilkan error Access Denied.

* CORS Enabled: Backend mengaktifkan Access-Control-Allow-Origin: * untuk mempermudah komunikasi lokal antar file HTML mandiri dengan port server lokal.

<img src="https://raw.githubusercontent.com/Rm19x/TaskManager.Professional/refs/heads/main/task.png">
