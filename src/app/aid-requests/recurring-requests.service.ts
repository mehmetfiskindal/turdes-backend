import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../firebase/fcm/firebase-admin.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RecurringRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  // DTO for creating a recurring aid request schedule
  async createRecurringAidRequestSchedule(
    aidRequestId: number,
    schedule: {
      frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
      dayOfWeek?: number; // 0-6 for Sunday-Saturday
      dayOfMonth?: number; // 1-31
      timeOfDay: string; // HH:MM format
      endDate?: Date;
    },
  ) {
    // First find the aid request and ensure it exists
    const aidRequest = await this.prisma.aidRequest.findUnique({
      where: { id: aidRequestId },
    });

    if (!aidRequest) {
      throw new Error('Aid request not found');
    }

    // Set the aid request to recurring
    await this.prisma.aidRequest.update({
      where: { id: aidRequestId },
      data: { recurring: true },
    });

    // Create the schedule in the database
    // In a real implementation, you would have a Schedule model
    // For this example, we'll use a generic JSON field in a notification
    const scheduleNotification = await this.prisma.notification.create({
      data: {
        content: JSON.stringify({
          type: 'RECURRING_SCHEDULE',
          aidRequestId,
          schedule,
        }),
        userId: aidRequest.userId,
      },
    });

    return {
      success: true,
      aidRequestId,
      schedule,
      nextOccurrence: this.calculateNextOccurrence(schedule),
    };
  }

  // Calculate the next occurrence based on schedule
  private calculateNextOccurrence(schedule: any): Date {
    const now = new Date();
    let nextDate = new Date();

    // Parse time components
    const [hours, minutes] = schedule.timeOfDay.split(':').map(Number);

    // Set the time part
    nextDate.setHours(hours, minutes, 0, 0);

    // If the time today has already passed, start from tomorrow
    if (nextDate < now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    switch (schedule.frequency) {
      case 'DAILY':
        // Already set for the next day
        break;
      case 'WEEKLY':
        // Set to the next occurrence of the specified day of week
        const currentDay = nextDate.getDay();
        const targetDay = schedule.dayOfWeek || 0; // Default to Sunday
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Ensure it's in the future
        nextDate.setDate(nextDate.getDate() + daysToAdd);
        break;
      case 'BIWEEKLY':
        // Similar to weekly but with a 2-week interval
        const currDay = nextDate.getDay();
        const tgtDay = schedule.dayOfWeek || 0;
        let daysToWeek = tgtDay - currDay;
        if (daysToWeek <= 0) daysToWeek += 7;
        nextDate.setDate(nextDate.getDate() + daysToWeek);
        // Add another week to make it biweekly
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        // Set to the specified day of the month
        const monthlyTargetDay = Math.min(
          schedule.dayOfMonth || 1,
          this.getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth() + 1),
        );
        if (nextDate.getDate() > monthlyTargetDay) {
          // Move to next month
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        nextDate.setDate(monthlyTargetDay);
        break;
    }

    return nextDate;
  }

  // Helper to get days in a month
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  // Run daily to check and process recurring aid requests
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringRequests() {
    try {
      console.log('Processing recurring aid requests');

      // Find all active aid requests marked as recurring
      const recurringRequests = await this.prisma.aidRequest.findMany({
        where: {
          recurring: true,
          isDeleted: false,
          status: { notIn: ['Completed', 'Cancelled'] },
        },
        include: {
          user: true,
          organization: true,
        },
      });

      for (const request of recurringRequests) {
        // Find the schedule for this request
        // In a real implementation, you'd have a proper Schedule model
        const scheduleNotifications = await this.prisma.notification.findMany({
          where: {
            userId: request.userId,
            content: { contains: `"aidRequestId":${request.id}` },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });

        if (scheduleNotifications.length === 0) continue;

        try {
          const scheduleData = JSON.parse(scheduleNotifications[0].content);
          const schedule = scheduleData.schedule;

          // Calculate if today is a scheduled day
          const today = new Date();
          let isScheduledDay = false;

          switch (schedule.frequency) {
            case 'DAILY':
              isScheduledDay = true;
              break;
            case 'WEEKLY':
              isScheduledDay = today.getDay() === schedule.dayOfWeek;
              break;
            case 'BIWEEKLY':
              // This is simplified - a real implementation would track actual dates
              isScheduledDay =
                today.getDay() === schedule.dayOfWeek &&
                today.getDate() % 14 < 7;
              break;
            case 'MONTHLY':
              isScheduledDay = today.getDate() === schedule.dayOfMonth;
              break;
          }

          // If today is a scheduled day, send notifications
          if (isScheduledDay) {
            // Send notification to the user
            await this.firebaseAdminService.sendPushNotification(
              request.userId.toString(),
              'Scheduled Aid Request Reminder',
              `Your recurring aid request "${request.description}" is scheduled for today.`,
            );

            // Send notification to the organization if assigned
            if (request.organizationId) {
              // In a real app, you'd have organization notification tokens
              // For now, we'll create an internal notification
              await this.prisma.notification.create({
                data: {
                  content: `Recurring aid request #${request.id} for ${request.user.name} is scheduled for today.`,
                  userId: 1, // Admin user
                },
              });
            }
          }
        } catch (err) {
          console.error(
            `Error processing schedule for request ${request.id}:`,
            err,
          );
        }
      }
    } catch (err) {
      console.error('Error in recurring requests scheduler:', err);
    }
  }

  // Get all recurring aid requests for a user
  async getUserRecurringRequests(userId: number) {
    const requests = await this.prisma.aidRequest.findMany({
      where: {
        userId,
        recurring: true,
        isDeleted: false,
      },
      include: {
        organization: true,
        location: true,
      },
    });

    // For each request, get its schedule
    const enhancedRequests = [];

    for (const request of requests) {
      // Find the schedule for this request
      const scheduleNotifications = await this.prisma.notification.findMany({
        where: {
          userId,
          content: { contains: `"aidRequestId":${request.id}` },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      let schedule = null;
      let nextOccurrence = null;

      if (scheduleNotifications.length > 0) {
        try {
          const scheduleData = JSON.parse(scheduleNotifications[0].content);
          schedule = scheduleData.schedule;
          nextOccurrence = this.calculateNextOccurrence(schedule);
        } catch (err) {
          console.error(
            `Error parsing schedule for request ${request.id}:`,
            err,
          );
        }
      }

      enhancedRequests.push({
        ...request,
        schedule,
        nextOccurrence,
      });
    }

    return enhancedRequests;
  }
}
