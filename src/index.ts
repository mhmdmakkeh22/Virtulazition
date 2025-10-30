import http from 'http';
import si from 'systeminformation';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/v1/sysinfo' && req.method === 'GET') {
    try {
      const systemInfo = {
        cpu: await si.cpu(),
        system: await si.system(),
        mem: await si.mem(),
        os: await si.osInfo(),
        currentLoad: await si.currentLoad(),
        processes: await si.processes(),
        diskLayout: await si.diskLayout(),
        networkInterfaces: await si.networkInterfaces(),
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(systemInfo, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch system information' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/api/v1/sysinfo`);
});
