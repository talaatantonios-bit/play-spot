import { ApiBodyOptions } from '@nestjs/swagger';

export const CreateDeviceSwaggerBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['name', 'deviceType', 'roomHourlyPrice', 'singleHourlyPrice', 'multiplayerHourlyPrice'],
    properties: {
      name:                   { type: 'string', example: 'PS5 Room 1' },
      deviceNumber:           { type: 'string', example: 'D-001' },
      deviceType:             { type: 'string', enum: ['PS4', 'PS5', 'VIP_PS5', 'Xbox_Series_X', 'Gaming_PC'] },
      roomHourlyPrice:        { type: 'integer', example: 100 },
      singleHourlyPrice:      { type: 'integer', example: 80 },
      multiplayerHourlyPrice: { type: 'integer', example: 60 },
      isVipRoom:              { type: 'boolean', example: false },
      maxPlayers:             { type: 'integer', example: 4 },
      displayOrder:           { type: 'integer', example: 0 },
      gameIds:                { type: 'array', items: { type: 'string', format: 'uuid' } },
      image:                  { type: 'string', format: 'binary' },
    },
  },
};

export const UpdateDeviceSwaggerBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      name:                   { type: 'string' },
      deviceNumber:           { type: 'string' },
      deviceType:             { type: 'string', enum: ['PS4', 'PS5', 'VIP_PS5', 'Xbox_Series_X', 'Gaming_PC'] },
      status:                 { type: 'string', enum: ['available', 'busy', 'offline', 'maintenance'] },
      roomHourlyPrice:        { type: 'integer' },
      singleHourlyPrice:      { type: 'integer' },
      multiplayerHourlyPrice: { type: 'integer' },
      isVipRoom:              { type: 'boolean' },
      maxPlayers:             { type: 'integer' },
      displayOrder:           { type: 'integer' },
      isActive:               { type: 'boolean' },
      gameIds:                { type: 'array', items: { type: 'string', format: 'uuid' } },
      image:                  { type: 'string', format: 'binary' },
    },
  },
};
