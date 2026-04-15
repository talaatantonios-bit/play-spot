import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../enums/role.enum';
import { GetCurrentUserId } from '../../../helpers/get-current-user-id.decorator';

@ApiTags('mobile/booking')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('mobile/booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiCreatedResponse({ description: 'Booking created successfully with pending status' })
  @ApiBadRequestResponse({ description: 'Invalid input or insufficient balance' })
  @ApiNotFoundResponse({ description: 'Device or branch not found' })
  @ApiConflictResponse({ description: 'Device already booked for selected time' })
  createBooking(
    @GetCurrentUserId() userId: number,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all my bookings' })
  @ApiOkResponse({ description: 'Paginated list of bookings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listMyBookings(
    @GetCurrentUserId() userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.bookingService.listMyBookings(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific booking by ID' })
  @ApiOkResponse({ description: 'Booking details' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiForbiddenResponse({ description: 'You do not have access to this booking' })
  getMyBooking(
    @GetCurrentUserId() userId: number,
    @Param('id') id: string,
  ) {
    return this.bookingService.getMyBooking(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiOkResponse({ description: 'Booking cancelled successfully' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiBadRequestResponse({ description: 'Cancellation not allowed (less than 10 minutes before start time)' })
  @ApiForbiddenResponse({ description: 'You do not have access to this booking' })
  cancelBooking(
    @GetCurrentUserId() userId: number,
    @Param('id') id: string,
  ) {
    return this.bookingService.cancelBooking(userId, id);
  }
}
