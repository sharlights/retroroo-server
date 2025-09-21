import { RetroCard } from '../board/card/retro-card.dto';
import { RetroList } from '../board/lists/retro-list.dto';
import { RetroUser } from '../board/users/retro-user.dto';
import { RetroStage } from '../types/stages';
import { RetroDecision } from '../decision/retro.decision';
import { RetroBoard } from '../board/retro-board.dto';
import { RetroIntent } from '../intent/retro-intent.dto';
import { RetroAction } from '../actions/retro-action';

/**
 * Board
 */
export interface BoardUpdatedEvent {
  board: RetroBoard;
}

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
  cardId: string;
  toListId: string;
  belowCardId: string;
  aboveCardId: string;
}

/**
 *
 * Lists
 *
 */
export interface ListsUpdatedEvent {
  lists: RetroList[];
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
  finishedUsers: string[];
}

export interface UpdateStageFinishedRequest {
  stage: RetroStage;
  finished: boolean;
}

export interface StageMetadataUpdatedEvent {
  stage: RetroStage;
  finishedUsers: string[];
}

/**
 * Actions
 */
export interface ActionCreateRequest {
  description: string;
}

export interface ActionUpdatedEvent {
  action: RetroAction;
}

export interface ActionGetRequest {}

export interface ActionGetEvent {
  actions: RetroAction[];
}

/**
 * Decisions
 */
export interface DecisionCreateRequest {
  description: string;
}

export interface DecisionUpdatedEvent {
  decision: RetroDecision;
}

export interface DecisionGetRequest {}

export interface DecisionGetEvent {
  decisions: RetroDecision[];
}

/**
 * Intentions
 */
export interface IntentSelectRequest {
  selectedIntent: RetroIntent;
}
