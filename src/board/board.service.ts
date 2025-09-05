import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroStage } from '../types/stages';
import { RetroBoard } from './retro-board.dto';
import { RetroBoardEntity } from './retro-board.entity';

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
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(RetroBoardEntity)
    private readonly boardRepo: Repository<RetroBoardEntity>,
  ) {}

  async getBoard(boardId: string): Promise<RetroBoard> {
    const entity = await this.boardRepo.findOne({ where: { id: boardId } });
    if (!entity) {
      this.logger.warn(`Board ${boardId} not found`);
      throw new NotFoundException(`Board ${boardId} not found`);
    }
    return this.toDto(entity);
  }

  async boardExists(boardId: string): Promise<boolean> {
    return !!(await this.boardRepo.findOne({ where: { id: boardId } }));
  }

  async createNewBoard(): Promise<RetroBoard> {
    const board = this.boardRepo.create({
      id: crypto.randomUUID(),
      stage: RetroStage.EXPLORE,
    });
    const saved = await this.boardRepo.save(board);
    this.logger.log(`[Board: ${saved.id}] Created`);
    return this.toDto(saved);
  }

  async updateStage(boardId: string, stage: RetroStage): Promise<RetroBoard> {
    const board = await this.boardRepo.findOneOrFail({ where: { id: boardId } });
    board.stage = stage;
    const updated = await this.boardRepo.save(board);
    this.eventEmitter.emit('stage.changed', { stage: updated.stage });
    return this.toDto(updated);
  }

  async updateBoard(boardId: string, updates: Partial<RetroBoard>): Promise<RetroBoard> {
    const board = await this.boardRepo.findOneOrFail({ where: { id: boardId } });
    const merged = this.boardRepo.merge(board, updates);
    const saved = await this.boardRepo.save(merged);
    this.logger.log(`[Board: ${boardId}] Updated`);
    return this.toDto(saved);
  }

  private toDto(entity: RetroBoardEntity): RetroBoard {
    return {
      id: entity.id,
      createdDate: entity.createdDate,
      stage: entity.stage,
      intention: entity.intention,
    };
  }
}
