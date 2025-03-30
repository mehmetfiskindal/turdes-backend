import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const contactInfo = await this.prisma.contactInfo.create({
      data: {
        phone: createOrganizationDto.phone,
        email: createOrganizationDto.email,
        contactName: createOrganizationDto.contactName,
        contactPhone: createOrganizationDto.contactPhone,
        contactEmail: createOrganizationDto.contactEmail,
      },
    });

    const address = await this.prisma.address.create({
      data: {
        address: createOrganizationDto.address,
        latitude: createOrganizationDto.latitude,
        longitude: createOrganizationDto.longitude,
      },
    });

    return this.prisma.organization.create({
      data: {
        name: createOrganizationDto.name,
        type: createOrganizationDto.type,
        mission: createOrganizationDto.mission,
        contactInfo: {
          connect: { id: contactInfo.id },
        },
        address: {
          connect: { id: address.id },
        },
      },
    });
  }

  findAll() {
    return this.prisma.organization.findMany();
  }

  findOne(id: number) {
    return this.prisma.organization.findUnique({
      where: { id: Number(id) },
    });
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: Number(id) },
      include: {
        contactInfo: true,
        address: true,
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const updatedContactInfo = await this.prisma.contactInfo.update({
      where: { id: organization.contactInfoId },
      data: {
        phone: updateOrganizationDto.phone,
        email: updateOrganizationDto.email,
        contactName: updateOrganizationDto.contactName,
        contactPhone: updateOrganizationDto.contactPhone,
        contactEmail: updateOrganizationDto.contactEmail,
      },
    });

    const updatedAddress = await this.prisma.address.update({
      where: { id: organization.addressId },
      data: {
        address: updateOrganizationDto.address,
        latitude: updateOrganizationDto.latitude,
        longitude: updateOrganizationDto.longitude,
      },
    });

    return this.prisma.organization.update({
      where: { id: Number(id) },
      data: {
        name: updateOrganizationDto.name,
        type: updateOrganizationDto.type,
        mission: updateOrganizationDto.mission,
        contactInfo: {
          connect: { id: updatedContactInfo.id },
        },
        address: {
          connect: { id: updatedAddress.id },
        },
      },
    });
  }

  remove(id: number) {
    return this.prisma.organization.delete({
      where: { id: Number(id) },
    });
  }

  sendMessage(id: number, createMessageDto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        organization: {
          connect: { id: id },
        },
        sender: { connect: { id: createMessageDto.senderId } }, // Ensure senderId exists in CreateMessageDto
        receiver: { connect: { id: createMessageDto.receiverId } }, // Ensure receiverId exists in CreateMessageDto
      },
    });
  }

  async createMessage(
    content: string,
    organizationId: number,
    senderId: number,
    receiverId: number,
  ) {
    return this.prisma.message.create({
      data: {
        content,
        organization: { connect: { id: organizationId } },
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
      },
    });
  }

  async addRatingAndFeedback(organizationId: number, rating: number, feedback: string) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        rating,
        feedback,
      },
    });
  }

  async flagOrganization(organizationId: number, reason: string) {
    // Get the organization to check if it exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    // Create a notification for administrators about the flagged organization
    await this.prisma.notification.create({
      data: {
        content: `Organization ${organization.name} has been flagged. Reason: ${reason}`,
        userId: 1, // Assuming user ID 1 is an admin, replace with appropriate admin user ID
      },
    });
    
    // Since there's no flagged field in the schema, we can store this information 
    // in feedback or create a proper flagging system in a future update
    return {
      success: true,
      message: `Organization ${organization.name} has been flagged for review.`
    };
  }

  async rateOrganization(organizationId: number, ratingData: any) {
    const { rating, feedback, userId, anonymous = false } = ratingData;
    
    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    // Store the rating in a new table or in this case, update the organization
    // In a real application, you would store individual ratings in a separate table
    // to track who rated what and calculate averages
    
    // Get current ratings to calculate new average
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { rating: true },
    });
    
    // Create a record of this specific rating
    // For now we'll simulate this since we don't have a ratings table
    await this.prisma.notification.create({
      data: {
        content: `Organization ${organizationId} received a ${rating} star rating${anonymous ? ' anonymously' : ''}: "${feedback}"`,
        userId: 1, // Admin user ID
      },
    });
    
    // Update the organization with the new rating and feedback
    // In a real app, you would calculate the average of all ratings
    const updatedOrganization = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        rating: organization.rating ? (organization.rating + rating) / 2 : rating,
        // Append new feedback to existing feedback or initialize
        feedback: (organization as any).feedback 
          ? `${(organization as any).feedback}\n---\n${anonymous ? 'Anonymous' : `User ${userId}`}: ${feedback}`
          : `${anonymous ? 'Anonymous' : `User ${userId}`}: ${feedback}`,
      },
    });
    
    return { 
      success: true, 
      message: 'Rating submitted successfully',
      currentRating: updatedOrganization.rating,
    };
  }

  async getOrganizationRatings(organizationId: number) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { 
        id: true,
        name: true,
        rating: true,
        feedback: true,
      },
    });
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    // Parse feedback entries if they exist
    const feedbackEntries = organization.feedback ? 
      organization.feedback.split('\n---\n').map(entry => {
        const [author, ...contentParts] = entry.split(': ');
        const content = contentParts.join(': '); // Rejoin in case feedback itself contained colons
        return {
          author,
          content,
          isAnonymous: author === 'Anonymous'
        };
      }) : [];
    
    return {
      id: organization.id,
      name: organization.name,
      rating: organization.rating || 0,
      feedbackEntries,
    };
  }
}
