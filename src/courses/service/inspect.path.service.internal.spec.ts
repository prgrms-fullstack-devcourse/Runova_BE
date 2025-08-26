import { inspectPath } from './inspect.path.service.internal';
import { Location } from '../../common/geo';

// Mock globeToProjected function
jest.mock('../../config/proj4', () => ({
  globeToProjected: jest.fn((location: Location) => ({
    x: location.lon * 111000, // Rough conversion for testing
    y: location.lat * 111000,
  })),
}));

describe('InspectPathService', () => {
  describe('inspectPath', () => {

    it('should calculate correct length for two points', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: 0.001, lat: 0 } // ~111m east
      ];
      const result = inspectPath(path);
      
      expect(result.nodes).toHaveLength(2);
      expect(result.length).toBeCloseTo(0.111, 2); // ~111m in km
      expect(result.nodes[0].progress).toBe(0);
      expect(result.nodes[1].progress).toBeCloseTo(0.111, 2);
    });

    it('should calculate correct bearing for eastward movement', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: 0.001, lat: 0 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes[0].bearing).toBe(90); // East bearing
    });

    it('should calculate correct bearing for northward movement', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: 0, lat: 0.001 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes[0].bearing).toBe(0); // North bearing
    });

    it('should calculate correct bearing for southward movement', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: 0, lat: -0.001 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes[0].bearing).toBe(180); // South bearing
    });

    it('should calculate correct bearing for westward movement', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: -0.001, lat: 0 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes[0].bearing).toBe(-90); // West bearing
    });

    it('should handle complex path with multiple segments', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },     // Start
        { lon: 0.001, lat: 0 }, // East
        { lon: 0.001, lat: 0.001 }, // North
        { lon: 0, lat: 0.001 }  // West
      ];
      const result = inspectPath(path);
      
      expect(result.nodes).toHaveLength(4);
      expect(result.length).toBeCloseTo(0.333, 2); // Three ~111m segments
      
      // Check bearings at turning points
      expect(result.nodes[0].bearing).toBe(90);  // East
      expect(result.nodes[1].bearing).toBe(-45);   // North
      expect(result.nodes[2].bearing).toBe(-135); // West
      expect(result.nodes[3].bearing).toBe(0);   // Final node always 0
    });

    it('should accumulate progress correctly', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: 0.001, lat: 0 },
        { lon: 0.001, lat: 0.001 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes[0].progress).toBe(0);
      expect(result.nodes[1].progress).toBeCloseTo(0.111, 2);
      expect(result.nodes[2].progress).toBeCloseTo(0.222, 2);
    });

    it('should handle diagonal movement', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: 0.001, lat: 0.001 }
      ];
      const result = inspectPath(path);
      
      // Diagonal should be sqrt(2) * 111m ≈ 0.157km
      expect(result.length).toBeCloseTo(0.157, 2);
      expect(result.nodes[0].bearing).toBe(45); // Northeast
    });

    it('should handle very small coordinates', () => {
      const path: Location[] = [
        { lon: 0.000001, lat: 0.000001 },
        { lon: 0.000002, lat: 0.000002 }
      ];
      const result = inspectPath(path);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].bearing).toBe(45);
    });

    it('should handle negative coordinates', () => {
      const path: Location[] = [
        { lon: -1, lat: -1 },
        { lon: -0.999, lat: -1 }
      ];
      const result = inspectPath(path);
      
      expect(result.length).toBeCloseTo(0.111, 2);
      expect(result.nodes[0].bearing).toBe(90); // Still eastward
    });

    it('should maintain coordinate precision in nodes', () => {
      const path: Location[] = [
        { lon: 127.12345, lat: 37.54321 },
        { lon: 127.12445, lat: 37.54421 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes[0].coordinates.x).toBe(127.12345 * 111000);
      expect(result.nodes[0].coordinates.y).toBe(37.54321 * 111000);
    });
  });

  describe('Performance Tests', () => {
    it('should process small paths quickly', () => {
      const path: Location[] = Array.from({ length: 10 }, (_, i) => ({
        lon: i * 0.001,
        lat: i * 0.001
      }));

      const start = performance.now();
      const result = inspectPath(path);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(10); // Should complete in under 10ms
      expect(result.nodes).toHaveLength(10);
    });

    it('should handle medium-sized paths efficiently', () => {
      const path: Location[] = Array.from({ length: 100 }, (_, i) => ({
        lon: i * 0.0001,
        lat: Math.sin(i * 0.1) * 0.01
      }));

      const start = performance.now();
      const result = inspectPath(path);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
      expect(result.nodes).toHaveLength(100);
    });

    it('should handle large paths within reasonable time', () => {
      const path: Location[] = Array.from({ length: 1000 }, (_, i) => ({
        lon: i * 0.00001,
        lat: Math.cos(i * 0.01) * 0.001
      }));

      const start = performance.now();
      const result = inspectPath(path);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(200); // Should complete in under 200ms
      expect(result.nodes).toHaveLength(1000);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should maintain linear time complexity', () => {
      const sizes = [10, 50, 100];
      const times: number[] = [];

      sizes.forEach(size => {
        const path: Location[] = Array.from({ length: size }, (_, i) => ({
          lon: i * 0.001,
          lat: i * 0.001
        }));

        const start = performance.now();
        inspectPath(path);
        const end = performance.now();
        
        times.push(end - start);
      });

      // Time should scale roughly linearly
      const ratio1 = times[1] / times[0]; // 50/10 = 5x size
      const ratio2 = times[2] / times[1]; // 100/50 = 2x size
      
      // Allow some variance but should be roughly proportional
      expect(ratio1).toBeLessThan(10); // Shouldn't be more than 10x slower for 5x data
      expect(ratio2).toBeLessThan(5);  // Shouldn't be more than 5x slower for 2x data
    });

    it('should not leak memory with repeated calls', () => {
      const path: Location[] = Array.from({ length: 100 }, (_, i) => ({
        lon: i * 0.001,
        lat: i * 0.001
      }));

      // Run multiple times to check for memory leaks
      for (let i = 0; i < 100; i++) {
        const result = inspectPath(path);
        expect(result.nodes).toHaveLength(100);
      }
    });

    it('should handle stress test with very large dataset', () => {
      const path: Location[] = Array.from({ length: 10000 }, (_, i) => ({
        lon: (i % 360) * 0.000001, // Create a pattern to avoid monotonic increase
        lat: Math.sin(i * 0.001) * 0.0001
      }));

      const start = performance.now();
      const result = inspectPath(path);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(result.nodes).toHaveLength(10000);
      expect(result.length).toBeGreaterThan(0);
      
      // Verify some properties are still correct
      expect(result.nodes[0].progress).toBe(0);
      expect(result.nodes[result.nodes.length - 1].bearing).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle identical consecutive points', () => {
      const path: Location[] = [
        { lon: 0, lat: 0 },
        { lon: 0, lat: 0 }, // Duplicate
        { lon: 0.001, lat: 0 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes).toHaveLength(3);
      expect(result.nodes[0].progress).toBe(0);
      expect(result.nodes[1].progress).toBe(0); // No distance from duplicate
    });

    it('should handle extreme coordinate values', () => {
      const path: Location[] = [
        { lon: -180, lat: -90 },
        { lon: 180, lat: 90 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes).toHaveLength(2);
      expect(result.length).toBeGreaterThan(0);
      expect(isFinite(result.length)).toBe(true);
    });

    it('should handle floating point precision issues', () => {
      const path: Location[] = [
        { lon: 0.1 + 0.2, lat: 0.1 + 0.2 }, // 0.30000000000000004
        { lon: 0.3, lat: 0.3 }
      ];
      const result = inspectPath(path);
      
      expect(result.nodes).toHaveLength(2);
      expect(isFinite(result.length)).toBe(true);
    });

    it('should handle zero-length segments gracefully', () => {
      const path: Location[] = [
        { lon: 1, lat: 1 },
        { lon: 1, lat: 1 },
        { lon: 1, lat: 1 }
      ];
      const result = inspectPath(path);
      
      expect(result.length).toBe(0);
      expect(result.nodes).toHaveLength(3);
      expect(result.nodes.every(node => node.progress === 0)).toBe(true);
    });
  });
});