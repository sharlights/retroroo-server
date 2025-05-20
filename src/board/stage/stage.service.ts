import { Injectable } from '@nestjs/common';
import { Board } from '../board.model';
import { EventEmitter2 } from '@nestjs/event-emitter';

export type RetroStage = 'headspace' | 'explore' | 'vote' | 'discuss' | 'done';

/**
 * This service manages the state transition between multiple stages. A stage is a stepping stone the users
 * will take as they continue on their retrospective journey. These stages can include:
 *
 * - Headspace (Icebreaker / Mindfulness)
 * The objective here is to select a small activity to place the participants in a certain state of mind.
 * This could be anything from reflective, safe, peaceful, stress-free, aware, self-reflective.
 * - Explore
 * The objective here is to analyse and explore the possible way of iterating the team to discover or continue success.
 * - Vote
 * The objective here is to vote on issues to collectively agree on the focus of the conversation.
 * - Discuss
 * The objective here is for participants to traverse through the ordered list of cards to analyse the most important
 * focus.
 * - Done
 * A complete overview of the retrospective, allowing the facilitator to export the retrospective in a PDF.
 */
@Injectable()
export class StageService {
  private stageMap: Map<Board, RetroStage> = new Map<Board, RetroStage>();

  constructor(private eventEmitter: EventEmitter2) {}

  setStage(board: Board, stage: RetroStage) {
    this.stageMap.set(board, stage);
    this.eventEmitter.emit('stage.changed', { stage: stage });
  }

  getCurrentStage(board: Board) {
    return this.stageMap.get(board);
  }
}
