import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConditionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deposit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valid_bet: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  code_count: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  type_code: number[];
}

export class SettingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  site: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  status: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  start_timestamp: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  end_timestamp: number;

  @ApiPropertyOptional({ type: [ConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions: ConditionDto[];
}
