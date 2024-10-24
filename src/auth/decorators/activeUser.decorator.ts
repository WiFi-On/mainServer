// src/auth/decorators/active-user.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_ACTIVE_KEY = 'is_active';
export const IsActive = () => SetMetadata(IS_ACTIVE_KEY, true);
