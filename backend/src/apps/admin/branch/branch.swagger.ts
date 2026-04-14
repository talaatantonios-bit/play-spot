import { ApiBodyOptions } from '@nestjs/swagger';

export const CreateBranchSwaggerBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['name', 'address', 'city', 'area'],
    properties: {
      name:           { type: 'string' },
      description:    { type: 'string' },
      address:        { type: 'string' },
      city:           { type: 'string' },
      area:           { type: 'string' },
      latitude:       { type: 'number' },
      longitude:      { type: 'number' },
      googleMapsUrl:  { type: 'string' },
      phoneNumber:    { type: 'string' },
      operatingHours: { type: 'string', description: 'JSON string e.g. {"saturday":{"open":"09:00","close":"22:00"}}' },
      image:          { type: 'string', format: 'binary' },
    },
  },
};

export const UpdateBranchSwaggerBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      name:           { type: 'string' },
      description:    { type: 'string' },
      address:        { type: 'string' },
      city:           { type: 'string' },
      area:           { type: 'string' },
      latitude:       { type: 'number' },
      longitude:      { type: 'number' },
      googleMapsUrl:  { type: 'string' },
      phoneNumber:    { type: 'string' },
      isActive:       { type: 'boolean' },
      operatingHours: { type: 'string', description: 'JSON string' },
      image:          { type: 'string', format: 'binary' },
    },
  },
};
