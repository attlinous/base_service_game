import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SettingService } from './setting.service';
import { SettingDto } from './dto/setting.dto';

@ApiTags('Setting')
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Put('update')
  @ApiBody({ type: SettingDto })
  async update_lottery_lucky(@Body() dto: SettingDto) {
    return this.settingService.update(dto);
  }

  @Get('find')
  @ApiQuery({ name: 'site', type: String })
  async find_setting_lottery_lucky(@Query('site') site: string) {
    return await this.settingService.findSetting(site);
  }
}
