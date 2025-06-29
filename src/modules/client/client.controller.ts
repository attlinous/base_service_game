import { Controller, Post, Body, Query, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import {
  IpAddress,
  Site,
  Username,
} from 'src/common/decorators/common.decorator';
import { maskPartialString } from 'src/common/helper/string.helper';
import { ApiK36Service } from 'src/services/api_k36_service';

@ApiTags('Client')
@ApiBearerAuth('TOKEN')
@Controller('client')
export class ClientController {
  private readonly logger = new Logger(ClientController.name);

  constructor(
    private readonly clientService: ClientService,
    private readonly api_k36_service: ApiK36Service,
  ) {}

  //==== điểm danh======
  @Post('customer-login')
  async customer_login(
    @Body() dto: CustomerLoginDto,
    @IpAddress() last_ip_login: string,
  ) {
    dto.last_ip_login = last_ip_login;
    return await this.clientService.loginGame(dto);
  }

  //========= mã nhận thưởng ==========
  // @Post('lottery/customer-login')
  // async lottery_customer_login(
  //   @Body() dto: CustomerLoginDto,
  //   @IpAddress() last_ip_login: string,
  //   @CreatedDate() created_date: number,
  // ) {
  //   dto.last_ip_login = last_ip_login;
  //   dto.created_date = created_date;
  //   return await this.clientService.customerLotteryLogin(dto);
  // }

  // @Get('lottery/customer-info')
  // async lottery_customer_info(
  //   @Site() site: string,
  //   @Username() username: string,
  //   @CreatedDate() created_date: number,
  // ) {
  //   return await this.clientService.findSettingLotteryCustomer(
  //     site,
  //     username,
  //     created_date,
  //   );
  // }

  // @Post('lottery/take-code')
  // async lottery_take_code(
  //   @Site() site: string,
  //   @Username() username: string,
  //   @CreatedDate() created_date: number,
  //   @Query('event_code_detail') event_code_detail: string,
  //   @Body('share_links') share_links?: string[],
  // ) {
  //   return await this.clientService.takeCodeLottery(
  //     site,
  //     username,
  //     event_code_detail,
  //     created_date,
  //     share_links || [],
  //   );
  // }

  // @Post('lottery/trade-giftcode')
  // async lottery_trade_giftcode(
  //   @Site() site: string,
  //   @Username() username: string,
  // ) {
  //   return await this.clientService.tradeCodeWithStreak(site, username);
  // }

  // @Get('lottery/history-take-code')
  // async history_take_code_lottery(
  //   @Site() site: string,
  //   @Username() username: string,
  // ) {
  //   return await this.clientService.historyTakeCodeLottery(site, username);
  // }
}
