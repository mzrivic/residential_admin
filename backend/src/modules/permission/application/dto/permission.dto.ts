import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, Length, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  description!: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class BulkCreatePermissionDto {
  @IsArray()
  permissions!: CreatePermissionDto[];

  @IsOptional()
  @IsBoolean()
  skip_duplicates?: boolean;

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkUpdatePermissionDto {
  @IsArray()
  updates!: {
    id: number;
    data: UpdatePermissionDto;
  }[];

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkDeletePermissionDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids!: number[];

  @IsOptional()
  @IsBoolean()
  permanent?: boolean;

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class PermissionFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  role_ids?: number[];

  @IsOptional()
  @IsDateString()
  created_after?: string;

  @IsOptional()
  @IsDateString()
  created_before?: string;
}

export class PermissionSortDto {
  @IsOptional()
  @IsEnum(['code', 'description', 'created_at', 'updated_at'])
  field?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  direction?: 'asc' | 'desc';
}

export class PermissionPaginationDto {
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