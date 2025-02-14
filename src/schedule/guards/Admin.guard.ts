import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { ScheduleService } from '../schedule.service';

@Injectable()
export class Admin implements CanActivate {
  constructor(private readonly scheduleService: ScheduleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const initData = request.headers['x-init-data'];

    const result = await this.scheduleService.isAdmin(initData);

    if (!result) {
      throw new HttpException('Unauthorized', 401);
    }

    return true;
  }
}
