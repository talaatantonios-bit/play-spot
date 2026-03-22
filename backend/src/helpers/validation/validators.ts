import { BadRequestException } from '@nestjs/common';

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new BadRequestException('Invalid email format');
  }
}

export function validatePhoneNumber(phone: string): void {
  // Allows optional leading +, followed by 8 to 20 characters of digits, spaces, dashes, or parentheses
  const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
  if (!phone || !phoneRegex.test(phone)) {
    throw new BadRequestException('Invalid phone number format');
  }
}
