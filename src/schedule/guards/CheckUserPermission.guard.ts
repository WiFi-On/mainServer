import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { ScheduleService } from '../schedule.service';

@Injectable()
export class CheckUserPermission implements CanActivate {
  constructor(private readonly scheduleService: ScheduleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const initData = request.headers['x-init-data'];

    const hasPermission = await this.scheduleService.checkUserActiveDayId(body.id, initData);
    if (!hasPermission) {
      throw new HttpException('Forbidden', 403);
    }

    return true;
  }
}
