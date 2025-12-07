import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, IsNotEmpty, IsInt } from 'class-validator';

export class CreateOtpDto {
  @ApiProperty({
    example: 1,
    description: 'User ID associated with the phone number',
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: '+989123456789',
    description: 'Phone number in +98XXXXXXXXXX format',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+98[0-9]{10}$/, {
    message: 'phoneNumber must be in +98XXXXXXXXXX format',
  })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '+989123456789',
    description: 'Phone number in +98XXXXXXXXXX format',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+98[0-9]{10}$/, {
    message: 'phoneNumber must be in +98XXXXXXXXXX format',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '1234',
    description: '4-digit OTP code',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{4}$/, {
    message: 'code must be a 4-digit number',
  })
  code: string;
}
