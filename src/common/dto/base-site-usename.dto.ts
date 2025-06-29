import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BaseSiteUserNameDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  site: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username: string;
}
