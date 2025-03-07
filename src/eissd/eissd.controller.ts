// Nest
import { Controller } from '@nestjs/common';

// Services
import { EissdService } from './eissd.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('eissd')
@Controller('api/v1/eissd')
export class EissdController {
  // private readonly logger = new Logger(EissdController.name);
  constructor(private readonly EissdService: EissdService) {}
}
