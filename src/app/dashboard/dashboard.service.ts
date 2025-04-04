import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAidDistributionStats() {
    // Get counts of total and delivered aid requests
    const totalAidRequests = await this.prisma.aidRequest.count({
      where: { isDeleted: false },
    });

    const deliveredAidRequests = await this.prisma.aidRequest.count({
      where: {
        isDeleted: false,
        status: 'Delivered',
      },
    });

    // Get aid requests grouped by category
    const aidRequestsByType = await this.prisma.aidRequest.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
      where: { isDeleted: false },
    });

    // Get counts of urgent aid requests
    const urgentAidRequests = await this.prisma.aidRequest.count({
      where: {
        isDeleted: false,
        isUrgent: true,
      },
    });

    // Get counts of verified vs reported aid requests
    const verifiedAidRequests = await this.prisma.aidRequest.count({
      where: {
        isDeleted: false,
        verified: true,
      },
    });

    const reportedAidRequests = await this.prisma.aidRequest.count({
      where: {
        isDeleted: false,
        reported: true,
      },
    });

    return {
      totalAidRequests,
      deliveredAidRequests,
      deliveryEfficiency:
        totalAidRequests > 0
          ? (deliveredAidRequests / totalAidRequests) * 100
          : 0,
      aidRequestsByType,
      urgentAidRequests,
      verifiedAidRequests,
      reportedAidRequests,
      integrityScore:
        totalAidRequests > 0
          ? (verifiedAidRequests / totalAidRequests) * 100
          : 0,
    };
  }

  async getUserCategoryStats() {
    // Get users grouped by category
    const usersByCategory = await this.prisma.user.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    return {
      usersByCategory,
      vulnerableUsersCount: usersByCategory
        .filter((category) =>
          ['ELDERLY', 'DISABLED', 'CHRONIC_ILLNESS'].includes(
            category.category,
          ),
        )
        .reduce((sum, category) => sum + category._count.id, 0),
    };
  }

  async getOrganizationStats() {
    // Get all organizations with their ratings
    const organizations = await this.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        rating: true,
      },
    });

    // Calculate average organization rating
    const totalRating = organizations.reduce(
      (sum, org) => sum + (org.rating || 0),
      0,
    );

    // Group organizations by type
    const organizationsByType = await this.prisma.organization.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    return {
      organizationsCount: organizations.length,
      averageRating:
        organizations.length > 0 ? totalRating / organizations.length : 0,
      organizationsByType,
      topRatedOrganizations: organizations
        .filter((org) => org.rating)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5),
    };
  }

  async getDonationStats() {
    // Get all donations
    const donations = await this.prisma.donation.findMany();

    // Get anonymous donations
    const anonymousDonations = await this.prisma.donation.findMany({
      where: { anonymous: true },
    });

    const totalAmount = donations.reduce(
      (sum, donation) => sum + donation.amount,
      0,
    );
    const anonymousAmount = anonymousDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0,
    );

    // Get donations over time (grouped by month)
    const donationsByMonth = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month, 
        SUM(amount) as total
      FROM "Donation"
      GROUP BY month
      ORDER BY month
    `;

    return {
      totalDonations: donations.length,
      anonymousDonations: anonymousDonations.length,
      totalAmount,
      anonymousAmount,
      anonymousPercentage:
        totalAmount > 0 ? (anonymousAmount / totalAmount) * 100 : 0,
      averageDonationAmount:
        donations.length > 0 ? totalAmount / donations.length : 0,
      donationsByMonth,
    };
  }

  async getAidEfficiencyByLocation() {
    // Get aid requests with locations
    const aidRequests = await this.prisma.aidRequest.findMany({
      where: { isDeleted: false },
      include: {
        location: true,
      },
    });

    // Group aid requests by location (rounded to 0.01 degrees for clustering)
    const locationClusters: {
      [key: string]: {
        latitude: number;
        longitude: number;
        totalRequests: number;
        deliveredRequests: number;
        urgentRequests: number;
        efficiency?: number;
      };
    } = {};

    aidRequests.forEach((request) => {
      // Round coordinates to create location clusters
      const latRounded = Math.round(request.location.latitude * 100) / 100;
      const lonRounded = Math.round(request.location.longitude * 100) / 100;
      const locationKey = `${latRounded},${lonRounded}`;

      if (!locationClusters[locationKey]) {
        locationClusters[locationKey] = {
          latitude: latRounded,
          longitude: lonRounded,
          totalRequests: 0,
          deliveredRequests: 0,
          urgentRequests: 0,
        };
      }

      locationClusters[locationKey].totalRequests++;

      if (request.status === 'Delivered') {
        locationClusters[locationKey].deliveredRequests++;
      }

      if (request.isUrgent) {
        locationClusters[locationKey].urgentRequests++;
      }
    });

    // Calculate efficiency for each cluster
    Object.values(locationClusters).forEach((cluster) => {
      cluster.efficiency =
        cluster.totalRequests > 0
          ? (cluster.deliveredRequests / cluster.totalRequests) * 100
          : 0;
    });

    return {
      locationClusters: Object.values(locationClusters),
    };
  }

  async getComprehensiveAnalytics() {
    const [
      aidStats,
      userStats,
      organizationStats,
      donationStats,
      locationStats,
    ] = await Promise.all([
      this.getAidDistributionStats(),
      this.getUserCategoryStats(),
      this.getOrganizationStats(),
      this.getDonationStats(),
      this.getAidEfficiencyByLocation(),
    ]);

    return {
      aidDistribution: aidStats,
      userCategories: userStats,
      organizations: organizationStats,
      donations: donationStats,
      locationEfficiency: locationStats,
      timestamp: new Date().toISOString(),
    };
  }
}
