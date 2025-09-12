import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { RetroStage } from '../types/stages';
import { RetroBoard } from './retro-board.dto';
import { RetroBoardEntity } from './retro-board.entity';
import { BoardViewMapper } from './board-view-mapper';

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
    private readonly boardViewMapper: BoardViewMapper,
  ) {}

  async getBoard(boardId: string): Promise<RetroBoard> {
    const entity = await this.boardRepo.findOne({ where: { id: boardId } });
    if (!entity) {
      this.logger.warn(`Board ${boardId} not found`);
      throw new NotFoundException(`Board ${boardId} not found`);
    }
    return this.boardViewMapper.toDto(entity);
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
    return this.boardViewMapper.toDto(saved);
  }

  async updateStage(boardId: string, stage: RetroStage): Promise<RetroBoard> {
    const board = await this.boardRepo.findOneOrFail({ where: { id: boardId } });
    board.stage = stage;
    const updated = await this.boardRepo.save(board);
    this.eventEmitter.emit('stage.changed', { stage: updated.stage });
    return this.boardViewMapper.toDto(updated);
  }

  async updateBoard(boardId: string, updates: Partial<RetroBoard>): Promise<RetroBoard> {
    const patch = this.toEntityPatch(updates); // returns DeepPartial<RetroBoardEntity>

    const entity = await this.boardRepo.preload({ id: boardId, ...patch });
    if (!entity) throw new NotFoundException(`Board ${boardId} not found`);
    const saved = await this.boardRepo.save(entity);
    this.logger.log(`[Board: ${boardId}] Updated`);
    return this.boardViewMapper.toDto(saved);
  }

  toEntityPatch(u: Partial<RetroBoard>): DeepPartial<RetroBoardEntity> {
    return {
      stage: u.stage,
      intention: u.intention ? ({ id: u.intention.id } as any) : undefined,
      lists: u.lists
        ? u.lists.map((l) => ({
            id: l.id,
            title: l.title,
            subtitle: l.subtitle,
            colour: l.colour,
            order: l.order,
          }))
        : undefined,
    };
  }
}
