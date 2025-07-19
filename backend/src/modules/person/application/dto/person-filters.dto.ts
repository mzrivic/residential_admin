import { IsOptional, IsString, IsArray, IsNumber, IsDateString, IsBoolean, IsEnum } from 'class-validator';

enum PersonStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  BLOCKED = 'BLOCKED'
}

export class PersonFiltersDto {
  @IsOptional()
  @IsString()
  search?: string; // Búsqueda en nombre, documento, email

  @IsOptional()
  @IsArray()
  @IsEnum(PersonStatus, { each: true })
  status?: PersonStatus[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roles?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  residential_units?: number[];

  @IsOptional()
  @IsDateString()
  created_after?: string;

  @IsOptional()
  @IsDateString()
  created_before?: string;

  @IsOptional()
  @IsBoolean()
  has_vehicles?: boolean;

  @IsOptional()
  @IsBoolean()
  has_roles?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  document_type?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  phone_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  document_verified?: boolean;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class PersonSortDto {
  @IsOptional()
  @IsEnum(['full_name', 'created_at', 'updated_at', 'document_number', 'status', 'priority'])
  field?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  direction?: 'asc' | 'desc';
}

export class PersonPaginationDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsBoolean()
  include_deleted?: boolean = false;
} 