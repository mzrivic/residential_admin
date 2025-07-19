import { IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';
import { UpdatePersonDto } from './update-person.dto';

export class BulkCreatePersonDto {
  @IsArray()
  @ValidateNested({ each: true })
  persons!: CreatePersonDto[];

  @IsOptional()
  @IsBoolean()
  skip_duplicates?: boolean;

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkUpdatePersonDto {
  @IsArray()
  @ValidateNested({ each: true })
  updates!: BulkUpdatePersonItemDto[];

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkUpdatePersonItemDto {
  @IsArray()
  @ValidateNested({ each: true })
  data!: UpdatePersonDto;

  @IsArray()
  id!: number;
}

export class BulkDeletePersonDto {
  @IsArray()
  ids!: number[];

  @IsOptional()
  @IsBoolean()
  permanent?: boolean;

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkAssignRolesDto {
  @IsArray()
  person_ids!: number[];

  @IsArray()
  role_ids!: number[];

  @IsOptional()
  @IsBoolean()
  validate_only?: boolean;
}

export class BulkValidationResult {
  valid!: boolean;
  errors!: string[];
  data?: any;
}

export class BulkOperationResult {
  total!: number;
  successful!: number;
  failed!: number;
  results!: {
    successful: Array<{ id: number; data: any }>;
    failed: Array<{ data: any; errors: string[] }>;
  };
} 