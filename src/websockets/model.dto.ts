import { RetroCard } from '../board/card/retro-card.dto';
import { RetroList } from '../board/lists/retro-list.dto';
import { RetroUser } from '../board/users/retro-user.dto';
import { RetroStage } from '../types/stages';

/**
 *
 * Card
 *
 */
export interface VoteForCardRequest {
  cardId: string;
  voteDelta: number;
}

export interface CreateCardRequest {
  clientId: string;
  listId: string;
  message: string;
}

export interface CardCreatedEvent {
  card: RetroCard;
}

export interface DeleteCardRequest {
  listId: string;
  cardId: string;
}

export interface CardDeletedEvent {
  cardId: string;
}

export interface UpdateCardRequest {
  listId: string;
  cardId: string;
  message: string;
}

export interface CardUpdatedEvent {
  card: RetroCard;
}

export interface MoveCardRequest {
  fromListId: string;
  toListId: string;
  cardId: string;
  targetIndex: number;
}

export interface CardMovedEvent {
  cardId: string;
  fromListId: string;
  toListId: string;
  newListIndex: number;
}

/**
 *
 * Lists
 *
 */
export interface ListUpdatedEvent {
  list: RetroList;
}

export interface DeleteListRequest {
  listId: string;
}

export interface ListDeletedEvent {
  listId: string;
}

export interface CreateListRequest {
  boardId: string;
  name: string;
  title: string;
  subtitle: string;
  order: number;
  colour: string;
}

export interface UpdateListRequest {
  boardId: string;
  listId: string;
  title: string;
  subtitle: string;
  order: number;
  colour: string;
}

/**
 *
 * Headspace
 *
 */

// Exercise
export interface ExerciseRequest {
  exerciseId?: string;
}

export interface ActionRequest {
  action: string;
  payload: any;
}

/**
 *
 * Users
 *
 */
export interface UserUpdatedPayload {
  users: RetroUser[];
}

/**
 * Stage
 */
export interface ChangeStageRequest {
  stage: RetroStage;
}

export interface StageChangedEvent {
  stage: RetroStage;
}

export interface UpdateStageFinishedRequest {
  stage: RetroStage;
  finished: boolean;
}

export interface StageMetadataUpdatedEvent {
  stage: RetroStage;
  finishedUsers: string[];
}
