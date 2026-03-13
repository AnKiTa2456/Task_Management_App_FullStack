import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Alice Morgan' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
