import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseSiteUserNameDto } from 'src/common/dto/base-site-usename.dto';

export class CustomerLoginDto extends BaseSiteUserNameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastBankNumber: string;

  created_date: number;

  last_ip_login: string;
}
