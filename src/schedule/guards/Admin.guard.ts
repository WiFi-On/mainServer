import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { ScheduleService } from '../schedule.service';

@Injectable()
export class Admin implements CanActivate {
  constructor(private readonly scheduleService: ScheduleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const initData = request.headers['x-init-data'];

    if (!(await this.scheduleService.isAdmin(initData))) {
      throw new HttpException('Forbidden', 403);
    }

    return true;
  }
}
