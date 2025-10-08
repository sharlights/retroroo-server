import { RetroCard } from '../board/card/retro-card.dto';
import { RetroList } from '../board/lists/retro-list.dto';
import { RetroBoard } from '../board/retro-board.dto';
import { RetroAction } from '../actions/retro-action';
import { RetroDecision } from '../decision/retro.decision';
import { RetroStage } from '../types/stages';
import { RetroUser } from '../board/users/retro-user.dto';

export interface BoardUpdatedEvent {
  board: RetroBoard;
}

export interface CardCreatedEvent {
  card: RetroCard;
}

export interface CardDeletedEvent {
  cardId: string;
}

export interface CardUpdatedEvent {
  card: RetroCard;
}

/** * * Lists * */
export interface ListsUpdatedEvent {
  lists: RetroList[];
}

export interface ListDeletedEvent {
  listId: string;
}

export interface ActionUpdatedEvent {
  action: RetroAction;
}

export interface DecisionUpdatedEvent {
  decision: RetroDecision;
}

export interface StageMetadataUpdatedEvent {
  stage: RetroStage;
  finishedUsers: string[];
}

export interface StageChangedEvent {
  stage: RetroStage;
  finishedUsers: string[];
}

export interface ActionGetEvent {
  actions: RetroAction[];
}

export interface DecisionGetEvent {
  decisions: RetroDecision[];
}

export interface UserUpdatedPayload {
  users: RetroUser[];
}
