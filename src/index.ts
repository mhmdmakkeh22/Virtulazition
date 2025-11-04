import http from "node:http";
import * as si from "systeminformation";

export interface ISystemInformation {
  cpu: si.Systeminformation.CpuData;
  system: si.Systeminformation.SystemData;
  mem: si.Systeminformation.MemData;
  os: si.Systeminformation.OsData;
  currentLoad: si.Systeminformation.CurrentLoadData;
  processes: si.Systeminformation.ProcessesData;
  diskLayout: si.Systeminformation.DiskLayoutData[];
  networkInterfaces:
    | si.Systeminformation.NetworkInterfacesData
    | si.Systeminformation.NetworkInterfacesData[];
}
//testing hello
// Fonction pure facile à tester
export async function getSysInfo(): Promise<ISystemInformation> {
  const [
    cpu, system, mem, osInfo, currentLoad, processes, diskLayout, networkInterfaces,
  ] = await Promise.all([
    si.cpu(),
    si.system(),
    si.mem(),
    si.osInfo(),
    si.currentLoad(),
    si.processes(),
    si.diskLayout(),
    si.networkInterfaces(),
  ]);

  return {
    cpu,
    system,
    mem,
    os: osInfo,
    currentLoad,
    processes,
    diskLayout,
    networkInterfaces,
  };
}



const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/v1/sysinfo") {
      const payload = await getSysInfo();
      const json = JSON.stringify(payload);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(json);
      return;
    }
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Internal server error", message: String(err?.message || err) }));
  }
});
//Test setup
const PORT = Number(process.env.PORT ?? 8000);
//test 2234
export const start = (port = PORT) => {
  return server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default server;
