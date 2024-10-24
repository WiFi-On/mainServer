// src/common/interfaces/request.interface.ts
import { Request } from 'express';
import { UserI } from './user.interface';

export interface AuthRequest extends Request {
  user: UserI;
}
