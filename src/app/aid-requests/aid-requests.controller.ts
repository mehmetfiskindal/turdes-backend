import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { AidRequestsService } from './aid-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';

import { CheckPolicies } from '../casl/check-policies.decorator';
import { Action } from '../casl/action';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@ApiTags('aidrequests')
@Controller('aidrequests')
export class AidRequestsController {
  constructor(private readonly aidRequestsService: AidRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all aid requests' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all aid requests.',
  })
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return this.aidRequestsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new aid request' })
  @ApiResponse({
    status: 201,
    description: 'The aid request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody(
    { type: CreateAidRequestDto } // Swagger için body tanımı
  ) // Swagger için body tanımı
  @Post()
  async create(
    @Body() createAidRequestDto: CreateAidRequestDto,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.id;
    return this.aidRequestsService.create(createAidRequestDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CheckPolicies((ability) => ability.can(Action.Read, 'AidRequest'))
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get a specific aid request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to retrieve',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'The ID of the organization to retrieve',
  })
  @Get(':id/:organizationId')
  async findOne(
    @Param('id') id: number,
    @Param('organizationId') organizationId: number,
    @Req() req: RequestWithUser
  ) {
    return this.aidRequestsService.findOne(id, req.user.id, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @CheckPolicies((ability) => ability.can(Action.Update, 'AidRequest'))
  @ApiOperation({ summary: 'Update the status of a specific aid request' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the status of the aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to update',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'The new status of the aid request',
        },
      },
    },
  })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: string,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.aidRequestsService.updateStatus(id, status, userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to a specific aid request' })
  @ApiResponse({
    status: 201,
    description: 'Successfully added comment to the aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to add comment',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content of the comment',
        },
      },
    },
  })
  @Post(':id/comments')
  async addComment(
    @Param('id') id: number,
    @Body('content') content: string
  ) {
    return this.aidRequestsService.addComment(id, content);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a document to a specific aid request' })
  @ApiResponse({
    status: 201,
    description: 'Successfully uploaded document to the aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to upload document',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentName: {
          type: 'string',
          description: 'The name of the document',
        },
        documentUrl: {
          type: 'string',
          description: 'The URL of the document',
        },
      },
    },
  })
  @Post(':id/documents')
  async uploadDocument(
    @Param('id') id: number,
    @Body('documentName') documentName: string,
    @Body('documentUrl') documentUrl: string
  ) {
    return this.aidRequestsService.uploadDocument(id, documentName, documentUrl);
  }

  //delete methodu eklendi
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific aid request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted aid request.',
  })
  @ApiResponse({ status: 404, description: 'Aid request not found' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the aid request to delete',
  })
  @Roles(Role.Admin)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'AidRequest'))
  @Patch(':id/delete')
  async delete(@Param('id') id: number) {
    return this.aidRequestsService.delete(id);
  }
}
