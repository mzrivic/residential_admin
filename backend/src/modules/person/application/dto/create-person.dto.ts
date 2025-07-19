import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEmail, 
  IsDateString, 
  IsEnum, 
  Length, 
  Matches,
  IsArray,
  ValidateNested,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

// Enum para tipos de documento
export enum DocumentType {
  CC = 'CC',
  CE = 'CE',
  TI = 'TI',
  PP = 'PP',
  NIT = 'NIT'
}

// Enum para género
export enum Gender {
  M = 'M',
  F = 'F',
  O = 'O'
}

// DTO para emails
export class PersonEmailDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;
}

// DTO para teléfonos
export class PersonPhoneDto {
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^[\+]?[0-9\s\-\(\)]{7,15}$/, { 
    message: 'El teléfono debe tener entre 7 y 15 dígitos' 
  })
  phone: string;
}

// DTO para imágenes
export class PersonImageDto {
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La URL de la imagen es obligatoria' })
  @Matches(/^https?:\/\/.+/, { 
    message: 'La URL de la imagen debe ser válida (http:// o https://)' 
  })
  image_url: string;
}

// DTO principal para crear persona
export class CreatePersonDto {
  @IsString({ message: 'El tipo de documento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  @IsEnum(DocumentType, { message: 'El tipo de documento debe ser CC, CE, TI, PP o NIT' })
  document_type: DocumentType;

  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Length(5, 20, { message: 'El número de documento debe tener entre 5 y 20 caracteres' })
  @Matches(/^[0-9A-Za-z\-]+$/, { 
    message: 'El número de documento solo puede contener números, letras y guiones' 
  })
  document_number: string;

  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @Length(2, 100, { message: 'El nombre completo debe tener entre 2 y 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { 
    message: 'El nombre completo solo puede contener letras y espacios' 
  })
  full_name: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'El género debe ser M, F u O' })
  gender?: Gender;

  @IsOptional()
  @IsString({ message: 'La URL de la foto debe ser una cadena de texto' })
  @Matches(/^https?:\/\/.+/, { 
    message: 'La URL de la foto debe ser válida (http:// o https://)' 
  })
  photo_url?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  birth_date?: string;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @Length(0, 1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notes?: string;

  @IsOptional()
  @IsString({ message: 'El alias debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El alias debe tener entre 1 y 50 caracteres' })
  alias?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  is_active?: boolean;

  // Arrays de contactos
  @IsOptional()
  @IsArray({ message: 'Los emails deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PersonEmailDto)
  emails?: PersonEmailDto[];

  @IsOptional()
  @IsArray({ message: 'Los teléfonos deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PersonPhoneDto)
  phones?: PersonPhoneDto[];

  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => PersonImageDto)
  images?: PersonImageDto[];

  // Campos para autenticación (opcionales)
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @Length(3, 30, { message: 'El nombre de usuario debe tener entre 3 y 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { 
    message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' 
  })
  username?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Length(6, 100, { message: 'La contraseña debe tener entre 6 y 100 caracteres' })
  password?: string;

  // Campos para UX
  @IsOptional()
  @IsString({ message: 'El idioma debe ser una cadena de texto' })
  @Length(2, 5, { message: 'El código de idioma debe tener entre 2 y 5 caracteres' })
  language?: string;

  @IsOptional()
  @IsString({ message: 'La zona horaria debe ser una cadena de texto' })
  timezone?: string;
} 