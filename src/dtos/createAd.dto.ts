import {
  BodyType,
  Feature,
  FuelType,
  RegisteredIn,
} from '../common/enums';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsIn,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdDto {
  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  engine_capacity: number;

  @IsString()
  @IsNotEmpty()
  variant: string;

  @IsEnum(FuelType)
  @IsOptional()
  fuel_type?: FuelType = FuelType.PETROL;

  @IsString()
  @IsNotEmpty()
  transmission: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  mileage: number;

  @IsEnum(BodyType)
  @IsOptional()
  body_type?: BodyType = BodyType.DEFAULT;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  features?: Feature[];

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  images?: string[];

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(RegisteredIn)
  @IsOptional()
  registered_in?: RegisteredIn = RegisteredIn.UNREGISTERED;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
  model_year: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parseFloat(value);
    return value;
  })
  price: number;

  @IsString()
  @IsOptional()
  description?: string;
}
