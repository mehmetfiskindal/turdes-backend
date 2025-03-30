import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { google } from 'googleapis';

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(createVolunteerDto: CreateVolunteerDto) {
    return this.prisma.volunteer.create({
      data: createVolunteerDto,
    });
  }

  async assignTask(assignTaskDto: AssignTaskDto) {
    return this.prisma.taskAssignment.create({
      data: {
        volunteerId: assignTaskDto.volunteerId,
        taskId: assignTaskDto.taskId,
      },
    });
  }

  async optimizeRoute(volunteerId: number) {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: { TaskAssignment: { include: { task: true } } },
    });

    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    const tasks = volunteer.TaskAssignment.map((assignment) => assignment.task);

    const waypoints = tasks.map((task) => ({
      location: `${task.latitude},${task.longitude}`,
      stopover: true,
    }));

    const directions = await this.getOptimizedRoute(waypoints);

    return directions;
  }

  private async getOptimizedRoute(waypoints: any[]) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const directionsService = new google.maps.DirectionsService();

    const request = {
      origin: waypoints[0].location,
      destination: waypoints[waypoints.length - 1].location,
      waypoints: waypoints.slice(1, -1),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(`Directions request failed due to ${status}`);
        }
      });
    });
  }
}
