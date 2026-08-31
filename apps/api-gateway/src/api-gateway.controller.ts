import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from './auth/auth/auth.guard';
import { ApiGatewayService } from './api-gateway.service';
import { CreateRiderDto, CreateCoordinatesDTO } from '@app/rider-contracts';
import { LoginDto, RegisterDto } from '@app/auth-contracts';
import { AuthService } from './auth.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private readonly authService: AuthService,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('riders')
  createRider(@Body() createRiderDto: CreateRiderDto) {
    return this.apiGatewayService.createRider(createRiderDto);
  }

  @Get('riders/:id')
  getRiderById(@Param('id') id: string) {
    return this.apiGatewayService.getRiderById(id);
  }

  @Get('riders')
  getAllRiders() {
    return this.apiGatewayService.getAllRiders();
  }

  @Post('/riders/coordinates')
  coordinateRider(@Body() coordinateRiderDto: CreateCoordinatesDTO) {
    return this.apiGatewayService.createCoordinateRider(coordinateRiderDto);
  }

  @Get('riders/coordinates/:id')
  getRiderCoordinates(@Param('id') id: string) {
    return this.apiGatewayService.getRiderCoordinates(id);
  }

  // Authentication endpoints
  @Post('auth/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('auth/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get('auth/profile')
  getProfile(@Req() req: { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }
}
