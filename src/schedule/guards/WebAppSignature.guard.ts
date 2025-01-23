import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { ScheduleService } from '../schedule.service';

@Injectable()
export class WebAppSignature implements CanActivate {
  constructor(private readonly scheduleService: ScheduleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const initData = request.headers['x-init-data'];
    if (!initData) {
      throw new HttpException('Missing init data in headers', 400);
    }

    if (!(await this.scheduleService.checkWebAppSignature(initData))) {
      throw new HttpException('Unauthorized', 401);
    }

    return true;
  }
}
