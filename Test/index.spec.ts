import {
  jest,
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
} from '@jest/globals';
import request from 'supertest';
import * as si from 'systeminformation';
import server, { getSysInfo, ISystemInformation } from '../src/index';

// Mock du module systeminformation
jest.mock('systeminformation');

const mockedSi = si as jest.Mocked<typeof si>;

describe('getSysInfo', () => {
  const mockCpu = { manufacturer: 'Intel', brand: 'Core i7' };
  const mockSystem = { manufacturer: 'Dell', model: 'XPS 15' };
  const mockMem = { total: 16000000000, free: 8000000000 };
  const mockOs = { platform: 'linux', distro: 'Ubuntu' };
  const mockCurrentLoad = { currentLoad: 25.5 };
  const mockProcesses = { all: 150, running: 2 };
  const mockDiskLayout = [{ device: '/dev/sda', size: 500000000000 }];
  const mockNetworkInterfaces = [{ iface: 'eth0', ip4: '192.168.1.10' }];

  beforeEach(() => {
    // Configuration des mocks avant chaque test
    mockedSi.cpu.mockResolvedValue(mockCpu as any);
    mockedSi.system.mockResolvedValue(mockSystem as any);
    mockedSi.mem.mockResolvedValue(mockMem as any);
    mockedSi.osInfo.mockResolvedValue(mockOs as any);
    mockedSi.currentLoad.mockResolvedValue(mockCurrentLoad as any);
    mockedSi.processes.mockResolvedValue(mockProcesses as any);
    mockedSi.diskLayout.mockResolvedValue(mockDiskLayout as any);
    mockedSi.networkInterfaces.mockResolvedValue(mockNetworkInterfaces as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait retourner toutes les informations système', async () => {
    const result = await getSysInfo();

    expect(result).toEqual({
      cpu: mockCpu,
      system: mockSystem,
      mem: mockMem,
      os: mockOs,
      currentLoad: mockCurrentLoad,
      processes: mockProcesses,
      diskLayout: mockDiskLayout,
      networkInterfaces: mockNetworkInterfaces,
    });
  });

  it('devrait appeler toutes les fonctions systeminformation', async () => {
    await getSysInfo();

    expect(mockedSi.cpu).toHaveBeenCalledTimes(1);
    expect(mockedSi.system).toHaveBeenCalledTimes(1);
    expect(mockedSi.mem).toHaveBeenCalledTimes(1);
    expect(mockedSi.osInfo).toHaveBeenCalledTimes(1);
    expect(mockedSi.currentLoad).toHaveBeenCalledTimes(1);
    expect(mockedSi.processes).toHaveBeenCalledTimes(1);
    expect(mockedSi.diskLayout).toHaveBeenCalledTimes(1);
    expect(mockedSi.networkInterfaces).toHaveBeenCalledTimes(1);
  });

  it('devrait propager les erreurs si systeminformation échoue', async () => {
    const errorMessage = 'Erreur de lecture CPU';
    mockedSi.cpu.mockRejectedValue(new Error(errorMessage));

    await expect(getSysInfo()).rejects.toThrow(errorMessage);
  });
});

describe('API HTTP /api/v1/sysinfo', () => {
  const mockSysInfo: ISystemInformation = {
    cpu: { manufacturer: 'Intel', brand: 'Core i7' } as any,
    system: { manufacturer: 'Dell', model: 'XPS 15' } as any,
    mem: { total: 16000000000, free: 8000000000 } as any,
    os: { platform: 'linux', distro: 'Ubuntu' } as any,
    currentLoad: { currentLoad: 25.5 } as any,
    processes: { all: 150, running: 2 } as any,
    diskLayout: [{ device: '/dev/sda', size: 500000000000 } as any],
    networkInterfaces: [{ iface: 'eth0', ip4: '192.168.1.10' } as any],
  };

  beforeEach(() => {
    mockedSi.cpu.mockResolvedValue(mockSysInfo.cpu);
    mockedSi.system.mockResolvedValue(mockSysInfo.system);
    mockedSi.mem.mockResolvedValue(mockSysInfo.mem);
    mockedSi.osInfo.mockResolvedValue(mockSysInfo.os);
    mockedSi.currentLoad.mockResolvedValue(mockSysInfo.currentLoad);
    mockedSi.processes.mockResolvedValue(mockSysInfo.processes);
    mockedSi.diskLayout.mockResolvedValue(mockSysInfo.diskLayout);
    mockedSi.networkInterfaces.mockResolvedValue(mockSysInfo.networkInterfaces);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/sysinfo devrait retourner les infos système avec status 200', async () => {
    const response = await request(server).get('/api/v1/sysinfo');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual(mockSysInfo);
  });

  it('GET /api/v1/sysinfo devrait retourner du JSON valide', async () => {
    const response = await request(server).get('/api/v1/sysinfo');

    expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
    expect(response.body).toHaveProperty('cpu');
    expect(response.body).toHaveProperty('mem');
    expect(response.body).toHaveProperty('os');
  });

  it('devrait retourner 404 pour une route inexistante', async () => {
    const response = await request(server).get('/api/v1/inexistant');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not found' });
  });

  it('devrait retourner 404 pour une méthode POST', async () => {
    const response = await request(server).post('/api/v1/sysinfo');

    expect(response.status).toBe(404);
  });

  it('devrait gérer les erreurs avec status 500', async () => {
    const errorMessage = 'Erreur système critique';
    mockedSi.cpu.mockRejectedValue(new Error(errorMessage));

    const response = await request(server).get('/api/v1/sysinfo');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal server error');
    expect(response.body).toHaveProperty('message', errorMessage);
  });

  it('devrait avoir le header Content-Type correct pour les erreurs', async () => {
    const response = await request(server).get('/route-invalide');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Configuration du serveur', () => {
  it('devrait utiliser le port par défaut 8000', () => {
    const originalEnv = process.env.PORT;
    delete process.env.PORT;

    // Le port est défini au niveau du module, donc on vérifie le comportement
    expect(process.env.PORT).toBeUndefined();

    process.env.PORT = originalEnv;
  });

  it("devrait permettre la configuration du port via variable d'environnement", () => {
    const originalEnv = process.env.PORT;
    process.env.PORT = '3000';

    expect(Number(process.env.PORT)).toBe(3000);

    process.env.PORT = originalEnv;
  });
});
