import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PagingDto } from 'src/common/dto/paging.dto';

export class GetAllDataDto extends PagingDto {
  @ApiProperty()
  @IsString()
  site: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username: string;
}
