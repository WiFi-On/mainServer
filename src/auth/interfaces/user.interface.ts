// src/auth/models/models.ts
export interface UserI {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  partner_id: number | null;
}
