import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RouteOptimizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate the optimal route for delivery using a greedy algorithm
   * In a real-world scenario, you would use a more sophisticated algorithm such as:
   * - A* algorithm
   * - Dijkstra's algorithm
   * - Held-Karp algorithm for TSP
   * Or leverage external services like Google Maps Directions API
   */
  async calculateOptimalRoute(startLatitude: number, startLongitude: number, deliveryIds: number[]) {
    // Get all delivery locations
    const deliveries = await this.prisma.aidRequest.findMany({
      where: {
        id: { in: deliveryIds },
        isDeleted: false,
      },
      include: {
        location: true,
      },
    });

    if (deliveries.length === 0) {
      return {
        route: [],
        totalDistance: 0,
        estimatedTime: 0,
      };
    }

    // Start with the starting point
    const startPoint = { latitude: startLatitude, longitude: startLongitude };
    
    // Implementation of a simple greedy algorithm to approximate TSP
    // This is a simplified version and not optimal for many locations
    const route = [];
    let unvisited = [...deliveries];
    let currentPoint = startPoint;
    let totalDistance = 0;
    
    // Visit the closest location each time until all locations are visited
    while (unvisited.length > 0) {
      let closestIndex = -1;
      let minDistance = Infinity;
      
      // Find the closest unvisited location
      for (let i = 0; i < unvisited.length; i++) {
        const distance = this.calculateDistance(
          currentPoint.latitude,
          currentPoint.longitude,
          unvisited[i].location.latitude,
          unvisited[i].location.longitude,
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      
      // Add the closest location to the route
      const nextStop = unvisited[closestIndex];
      route.push(nextStop);
      totalDistance += minDistance;
      
      // Update current position and remove the visited location
      currentPoint = {
        latitude: nextStop.location.latitude,
        longitude: nextStop.location.longitude,
      };
      unvisited.splice(closestIndex, 1);
    }
    
    // Calculate route back to start (optional)
    const returnDistance = this.calculateDistance(
      currentPoint.latitude,
      currentPoint.longitude,
      startPoint.latitude,
      startPoint.longitude,
    );
    totalDistance += returnDistance;
    
    // Estimate time based on avg speed of 40 km/h
    const averageSpeed = 40; // km/h
    const estimatedTime = totalDistance / averageSpeed; // hours
    
    return {
      route,
      totalDistance, // in km
      estimatedTime, // in hours
      startPoint,
      returnToStartIncluded: true,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}