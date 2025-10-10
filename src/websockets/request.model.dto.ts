import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsBoolean,
  IsEnum,
  ValidateNested,
  IsIn,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { RetroStage } from '../types/stages';

// If your IDs are UUIDs, keep IsUUID; otherwise switch to IsString.
class RetroIntentRef {
  @IsUUID()
  id!: string;
}

/* Cards */
export class VoteForCardRequest {
  @IsUUID()
  cardId!: string;

  @IsInt()
  @IsIn([-1, 1])
  voteDelta!: number;
}

export class CreateCardRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  clientId!: string;

  @IsUUID()
  listId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(({ value }) => (value ?? '').toString().trim().normalize('NFC'))
  message!: string;
}

export class DeleteCardRequest {
  @IsUUID()
  cardId!: string;
}

export class UpdateCardRequest {
  @IsUUID()
  listId!: string;

  @IsUUID()
  cardId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;
}

export class MoveCardRequest {
  @IsUUID()
  cardId!: string;

  @IsUUID()
  toListId!: string;

  @IsOptional()
  @IsUUID()
  belowCardId?: string;

  @IsOptional()
  @IsUUID()
  aboveCardId?: string;
}

/* Lists */
export class DeleteListRequest {
  @IsUUID()
  listId!: string;
}

export class CreateListRequest {
  @IsUUID()
  boardId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  subtitle!: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  colour!: string;
}

export class UpdateListRequest {
  @IsUUID()
  boardId!: string;

  @IsUUID()
  listId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  subtitle!: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  colour!: string;
}

/* Headspace */
export class ExerciseRequest {
  @IsOptional()
  @IsUUID()
  exerciseId?: string;
}

export class ActionRequest {
  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

/* Stage */
export class ChangeStageRequest {
  @IsEnum(RetroStage)
  stage!: RetroStage;
}

export class UpdateStageFinishedRequest {
  @IsEnum(RetroStage)
  stage!: RetroStage;

  @IsBoolean()
  finished!: boolean;
}

/* Actions */
export class ActionCreateRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(({ value }) => (value ?? '').toString().trim().normalize('NFC'))
  description!: string;
}

/* Decisions */
export class DecisionCreateRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(({ value }) => (value ?? '').toString().trim().normalize('NFC'))
  description!: string;
}

/* Intentions */
export class SelectIntentRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  selectedIntent!: number;
}
