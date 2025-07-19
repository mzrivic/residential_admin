import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, Length, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  alias?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permission_ids?: number[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  alias?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permission_ids?: number[];
}

export class AssignPermissionsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  permission_ids!: number[];
}

export class BulkCreateRoleDto {
  @IsArray()
  roles!: CreateRoleDto[];

  @IsOptional()
  @IsBoolean()
  skip_duplicates?: boolean;

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkUpdateRoleDto {
  @IsArray()
  updates!: {
    id: number;
    data: UpdateRoleDto;
  }[];

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkDeleteRoleDto {
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

export class RoleFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permission_ids?: number[];

  @IsOptional()
  @IsDateString()
  created_after?: string;

  @IsOptional()
  @IsDateString()
  created_before?: string;
}

export class RoleSortDto {
  @IsOptional()
  @IsEnum(['name', 'created_at', 'updated_at'])
  field?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  direction?: 'asc' | 'desc';
}

export class RolePaginationDto {
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