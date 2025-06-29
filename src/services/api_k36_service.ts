import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ENDPOINT } from '../settings/infomation';
import { generateHMAC } from 'src/common/helper/string.helper';
@Injectable()
export class ApiK36Service {
  private readonly logger = new Logger(ApiK36Service.name);

  constructor(private readonly http: HttpService) {}

  async getInfoMember(site: string, account: string) {
    try {
      const url = `${ENDPOINT.K36_78WIN}/api/player/find-player-okvip?site=${site}`;
      const payload = {
        playerid: account,
        site: site,
      };
      const response = await firstValueFrom(
        this.http.post(url, payload, {
          validateStatus: () => true,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`K36 API Get Info Member Error: ${error.message}`);
      return {
        status_code: 500,
        message: 'Lỗi khi gọi API',
      };
    }
  }

  async sendMessage(
    site: string,
    account: string,
    subject: string,
    content: string,
  ) {
    try {
      const url = `${ENDPOINT.K36_78WIN}/api/message/send-one-player?site=${site}`;
      const payload = {
        playerid: account,
        subject: subject,
        content: content,
      };
      const response = await firstValueFrom(
        this.http.post(url, payload, {
          validateStatus: () => true,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`K36 API Send Message Error: ${error.message}`);
      return {
        status_code: 500,
        message: 'Lỗi khi gọi API',
      };
    }
  }

  async getDepositByTimestamp(
    site: string,
    account: string,
    start_time: number,
    end_time: number,
  ) {
    try {
      const url = `${ENDPOINT.K36_78WIN}/api/deposit/find?site=${site}`;
      const payload = {
        playerid: account,
        start_time,
        end_time,
        is_payoff: false,
      };
      const response = await firstValueFrom(
        this.http.post(url, payload, {
          validateStatus: () => true,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`K36 API Get Deposit Error: ${error.message}`);
      return {
        status_code: 500,
        message: 'Lỗi khi gọi API',
      };
    }
  }

  async getWithdrawByTimestamp(
    site: string,
    account: string,
    start_time: number,
    end_time: number,
  ) {
    try {
      const url = `${ENDPOINT.K36_78WIN}/api/withdrawal/find?site=${site}`;
      const payload = {
        playerid: account,
        start_time,
        end_time,
        is_payoff: false,
      };
      const response = await firstValueFrom(
        this.http.post(url, payload, {
          validateStatus: () => true,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`K36 API Get Deposit Error: ${error.message}`);
      return {
        status_code: 500,
        message: 'Lỗi khi gọi API',
      };
    }
  }

  async getBetGeneral(
    site: string,
    account: string,
    start_time: number,
    end_time: number,
  ) {
    try {
      const url = `${ENDPOINT.K36_78WIN}/api/player/bet-general?site=${site}&playerid=${account}&start_timestamp=${start_time}&end_timestamp=${end_time}`;
      const response = await firstValueFrom(
        this.http.get(url, {
          validateStatus: () => true,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`K36 API Get Bet General Error: ${error.message}`);
      return {
        status_code: 500,
        message: 'Lỗi khi gọi API',
      };
    }
  }

  async betGeneralStatistical(
    site: string,
    max_limit: number,
    product_type_id: string,
    start_timestamp: number | null = null,
    end_timestamp: number | null = null,
  ): Promise<any> {
    try {
      const params = {
        site: site,
        max_limit,
        product_type_id,
        start_timestamp,
        end_timestamp,
      };

      const filteredParams: any = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null),
      );

      const query = new URLSearchParams(filteredParams).toString();
      const url = `${ENDPOINT.K36_78WIN}/main/bet-general-statistical?${query}`;

      const response = await firstValueFrom(
        this.http.get(url, {
          validateStatus: () => true,
        }),
      );

      const data = response.data;
      if (data?.status_code == 200 && data?.valid) {
        return data.result ?? {};
      }

      return 404;
    } catch (error) {
      this.logger.error(
        `Lỗi gọi API betGeneralStatistical - ${site} - ${error.message}`,
      );
      return 500;
    }
  }

  async createFreeCode(
    site: string,
    timeEndCode: number,
    releaseCode: string,
    promo_id: string,
    round: number,
    point: number,
    account: string,
  ) {
    try {
      const timeStamp = Date.now().toString();
      const keySign = `site=78win&reqTime=${timeStamp}`;
      const sign = generateHMAC(keySign, 'APIhaudai@att$$TELEBOT');

      const url =
        'https://api-freecode.code78k.ca/code/apiOpen/create-code-webapp?site=78win';
      const payload = {
        site: site,
        timeEndCode,
        releaseCode,
        promo_id,
        round,
        point,
        account,
        timeStamp,
        sign,
      };

      const response = await firstValueFrom(
        this.http.post(url, payload, {
          validateStatus: () => true,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Lỗi gọi API betGeneralStatistical - ${site} - ${error.message}`,
      );
      return 500;
    }
  }

  async checkAccount4LastBankNumber(
    site: string,
    account: string,
    lastBankNumber: string,
  ) {
    const info = await this.getInfoMember(site, account);
    if (info?.status_code != 200) {
      return false;
    }
    const matched = (info.result?.banksnameaccount || '')
      .split(',')
      .map((s: string) => s.split('-')[1]?.trim())
      .some((acc: string | undefined) => acc?.slice(-4) === lastBankNumber);
    return matched;
  }
}
