import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(createCampaignDto);
  }

  @Get()
  async findAllCampaigns() {
    return this.campaignsService.findAllCampaigns();
  }

  @Get(':id')
  async findCampaignById(@Param('id') id: number) {
    return this.campaignsService.findCampaignById(id);
  }

  @Patch(':id')
  async updateCampaign(
    @Param('id') id: number,
    @Body() updateCampaignDto: CreateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(id, updateCampaignDto);
  }

  @Delete(':id')
  async deleteCampaign(@Param('id') id: number) {
    return this.campaignsService.deleteCampaign(id);
  }

  @Post(':id/events')
  async createEvent(
    @Param('id') id: number,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.campaignsService.createEvent(id, createEventDto);
  }

  @Get(':id/events')
  async findAllEvents(@Param('id') id: number) {
    return this.campaignsService.findAllEvents(id);
  }

  @Get(':id/events/:eventId')
  async findEventById(
    @Param('id') id: number,
    @Param('eventId') eventId: number,
  ) {
    return this.campaignsService.findEventById(id, eventId);
  }

  @Patch(':id/events/:eventId')
  async updateEvent(
    @Param('id') id: number,
    @Param('eventId') eventId: number,
    @Body() updateEventDto: CreateEventDto,
  ) {
    return this.campaignsService.updateEvent(id, eventId, updateEventDto);
  }

  @Delete(':id/events/:eventId')
  async deleteEvent(
    @Param('id') id: number,
    @Param('eventId') eventId: number,
  ) {
    return this.campaignsService.deleteEvent(id, eventId);
  }
}
