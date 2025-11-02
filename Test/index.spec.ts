import request from 'supertest';
import * as si from 'systeminformation';
import server, { getSysInfo } from '../src/index';

// Mock systeminformation
jest.mock('systeminformation');

const mockedSi = si as jest.Mocked<typeof si>;

describe('System Information API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks for all tests
    mockedSi.cpu.mockResolvedValue({ manufacturer: 'Intel' } as any);
    mockedSi.system.mockResolvedValue({ model: 'Test' } as any);
    mockedSi.mem.mockResolvedValue({ total: 1000 } as any);
    mockedSi.osInfo.mockResolvedValue({ platform: 'linux' } as any);
    mockedSi.currentLoad.mockResolvedValue({ currentLoad: 50 } as any);
    mockedSi.processes.mockResolvedValue({ all: 100 } as any);
    mockedSi.diskLayout.mockResolvedValue([{ type: 'SSD' }] as any);
    mockedSi.networkInterfaces.mockResolvedValue([{ iface: 'eth0' }] as any);
  });

  describe('getSysInfo', () => {
    it('should return system information', async () => {
      const result = await getSysInfo();

      expect(result).toBeDefined();
      expect(result.cpu.manufacturer).toBe('Intel');
      expect(mockedSi.cpu).toHaveBeenCalledTimes(1);
    });

    it('should throw error when systeminformation fails', async () => {
      mockedSi.cpu.mockRejectedValue(new Error('Failed'));

      await expect(getSysInfo()).rejects.toThrow('Failed');
    });
  });

  describe('GET /api/v1/sysinfo', () => {
    it('should return 200 with system info', async () => {
      const response = await request(server)
        .get('/api/v1/sysinfo')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.cpu).toBeDefined();
      expect(response.body.system).toBeDefined();
    });

    it('should return 404 for unknown routes', async () => {
      const response = await request(server).get('/unknown').expect(404);

      expect(response.body.error).toBe('Not found');
    });

    it('should return 404 for POST requests', async () => {
      await request(server).post('/api/v1/sysinfo').expect(404);
    });

    it('should return 500 on error', async () => {
      mockedSi.cpu.mockRejectedValue(new Error('CPU failed'));

      const response = await request(server).get('/api/v1/sysinfo').expect(500);

      expect(response.body.error).toBe('Internal server error');
      expect(response.body.message).toBe('CPU failed');
    });
  });
});
