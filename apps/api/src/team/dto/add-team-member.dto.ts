import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, MaxLength } from 'class-validator';

export class AddTeamMemberDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email: string;

  // Only admins can be added through the API; owners come from OWNER_EMAILS config.
  @IsOptional()
  @IsIn(['ADMIN'])
  role?: 'ADMIN';
}
