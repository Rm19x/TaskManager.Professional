const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper untuk menjalankan perintah shell Command Line
function runCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
            if (err) reject(err);
            else resolve(stdout.trim());
        });
    });
}

const server = http.createServer(async (req, res) => {
    // Aktifkan CORS agar file HTML bisa berkomunikasi dengan server backend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Endpoint 1: Mengambil Informasi Sistem (OS, CPU, RAM, Disk, Uptime)
    if (req.url === '/api/sysinfo' && req.method === 'GET') {
        try {
            // Informasi OS, Arsitektur, CPU, dan Uptime Dasar dari bawaan Node.js
            const osInfo = `${os.type()} ${os.release()} (${os.arch()})`;
            const cpuInfo = os.cpus()[0].model;
            
            // Uptime Kalkulasi
            const uptimeSec = os.uptime();
            const diffHour = Math.floor(uptimeSec / 3600);
            const diffMin = Math.floor((uptimeSec % 3600) / 60);
            const uptimeInfo = `${diffHour} Jam ${diffMin} Menit`;

            // RAM Dinamis
            const totalRAM = Math.round(os.totalmem() / (1024 * 1024));
            const freeRAM = Math.round(os.freemem() / (1024 * 1024));
            const usedRAM = totalRAM - freeRAM;
            const ramInfo = `${usedRAM} MB / ${totalRAM} MB`;

            // Disk Free Space C: menggunakan wmic alternatif query
            let diskInfo = "N/A";
            try {
                const diskStdout = await runCommand('wmic logicaldisk where "DeviceID=\'C:\'" get FreeSpace');
                const diskLines = diskStdout.split('\n').map(l => l.trim()).filter(Boolean);
                if (diskLines[1]) {
                    const freeBytes = parseInt(diskLines[1], 10);
                    diskInfo = `${(freeBytes / 1073741824).toFixed(2)} GB Bebas / C:`;
                }
            } catch (e) { diskInfo = "Error membaca disk"; }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ osInfo, cpuInfo, ramInfo, diskInfo, uptimeInfo }));
        } catch (err) {
            res.writeHead(500); res.end(err.message);
        }
    }

    // Endpoint 2: Mengambil Daftar Proses Windows
    else if (req.url === '/api/processes' && req.method === 'GET') {
        try {
            const stdout = await runCommand('tasklist /fo csv /nh');
            const lines = stdout.split('\r\n').filter(Boolean);
            const processes = lines.map(line => {
                const parts = line.split('","').map(p => p.replace(/"/g, ''));
                return {
                    pid: parts[1],
                    name: parts[0],
                    port: parts[0] === "svchost.exe" ? "Dynamic" : "-"
                };
            }).filter(p => p.pid && p.name);
            
            // Urutkan A-Z berdasarkan nama proses
            processes.sort((a, b) => a.name.localeCompare(b.name));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(processes));
        } catch (err) {
            res.writeHead(500); res.end(err.message);
        }
    }

    // Endpoint 3: Mengambil Daftar Services yang Sedang Berjalan
    else if (req.url === '/api/services' && req.method === 'GET') {
        try {
            const stdout = await runCommand('sc query type= service state= all');
            const blocks = stdout.split('\r\n\r\n');
            const services = [];
            
            for (let block of blocks) {
                const nameMatch = block.match(/SERVICE_NAME:\s*(.*)/);
                const displayMatch = block.match(/DISPLAY_NAME:\s*(.*)/);
                const stateMatch = block.match(/STATE\s*:\s*\d+\s*(RUNNING|STOPPED|PAUSED)/);
                
                if (nameMatch && stateMatch && stateMatch[1] === "RUNNING") {
                    services.push({
                        name: nameMatch[1].trim(),
                        displayName: displayMatch ? displayMatch[1].trim() : nameMatch[1].trim(),
                        state: stateMatch[1].trim()
                    });
                    if (services.length >= 50) break; // Batasi 50 baris sesuai kode asli HTA
                }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(services));
        } catch (err) {
            res.writeHead(500); res.end(err.message);
        }
    }

    // Endpoint 4: Mematikan Proses Berdasarkan PID (Single atau Bulk)
    else if (req.url === '/api/kill' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { pids } = JSON.parse(body);
                if (!pids || pids.length === 0) {
                    res.writeHead(400); return res.end("No PIDs provided");
                }
                
                // Gabungkan perintah taskkill /F /PID xxxx
                const killCmd = pids.map(pid => `taskkill /F /PID ${pid}`).join(' & ');
                await runCommand(killCmd);
                
                res.writeHead(200); res.end("Proses berhasil dihentikan.");
            } catch (err) {
                res.writeHead(500); res.end("Beberapa atau semua proses gagal dihentikan.");
            }
        });
    }

    // Endpoint 5: Ekspor Daftar Proses ke TXT di Desktop
    else if (req.url === '/api/export' && req.method === 'POST') {
        try {
            const stdout = await runCommand('tasklist /fo table /nh');
            const desktopPath = path.join(os.homedir(), 'Desktop', 'MrRm19_Process_Log.txt');
            
            const logContent = `==================================================\r
   TASK MANAGER PROFESSIONAL 2026 LOG PROCESS     \r
   Dibuat Oleh: Mr.Rm19 | Diambil Pada: ${new Date().toLocaleString()}\r
==================================================\r
PID\tNama Proses\r
--------------------------------------------------\r
${stdout}`;

            fs.writeFileSync(desktopPath, logContent, 'utf-8');
            res.writeHead(200); res.end("Berhasil ekspor ke Desktop.");
        } catch (err) {
            res.writeHead(500); res.end(err.message);
        }
    }

    // Endpoint 6: Konsol Mini Menjalankan Perintah CMD Langsung
    else if (req.url === '/api/runcmd' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { cmd } = JSON.parse(body);
            if (cmd) {
                // Membuka jendela CMD baru yang mandiri sesuai fungsi asli HTA
                exec(`start cmd.exe /c "${cmd} & pause"`);
                res.writeHead(200); res.end("CMD Diluncurkan");
            } else {
                res.writeHead(400); res.end("Perintah Kosong");
            }
        });
    } else {
        res.writeHead(404); res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Backend Jembatan Sistem Berjalan di http://localhost:3000');
});
