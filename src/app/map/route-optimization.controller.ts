import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RouteOptimizationService } from './route-optimization.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('route-optimization')
@Controller('route-optimization')
export class RouteOptimizationController {
  constructor(private readonly routeOptimizationService: RouteOptimizationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate optimal route for aid delivery' })
  @ApiResponse({
    status: 200,
    description: 'Successfully calculated optimal route.',
  })
  @Post('calculate')
  async calculateOptimalRoute(
    @Body() body: { startLatitude: number; startLongitude: number; deliveryIds: number[] },
  ) {
    return this.routeOptimizationService.calculateOptimalRoute(
      body.startLatitude,
      body.startLongitude,
      body.deliveryIds,
    );
  }
}