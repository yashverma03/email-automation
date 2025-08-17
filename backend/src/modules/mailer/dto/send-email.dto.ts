import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, ArrayNotEmpty, IsArray } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'List of recipient email addresses',
    example: ['user1@example.com', 'user2@example.com'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  toEmails: string[];
}
