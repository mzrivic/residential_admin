import { IsString, IsOptional, IsEmail, IsPhoneNumber, IsDateString, IsEnum, IsBoolean, IsNumber, IsArray, Length, Matches } from 'class-validator';

enum PersonStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  BLOCKED = 'BLOCKED'
}

export class UpdatePersonDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  full_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(CC|CE|TI|PP|NIT)$/)
  document_type?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  document_number?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsEnum(['M', 'F', 'O'])
  gender?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  // Campos de autenticación
  @IsOptional()
  @IsString()
  @Length(3, 50)
  username?: string;

  @IsOptional()
  @IsString()
  password_hash?: string;

  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  notification_preferences?: any;

  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  phone_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  document_verified?: boolean;
} 