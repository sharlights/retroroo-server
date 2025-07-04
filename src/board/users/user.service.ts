import { Injectable, Logger } from '@nestjs/common';
import { BoardService } from '../board.service';
import { NotFoundError } from 'rxjs';
import { BoardRole } from '../../types/roles';
import { RetroUser } from './retro-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RetroUserEntity } from './retro-user.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly boardService: BoardService,
    @InjectRepository(RetroUserEntity)
    private readonly userRepo: Repository<RetroUserEntity>,
  ) {}

  async createUser(boardId: string, userId: string, role: BoardRole): Promise<RetroUser> {
    this.logger.log(`[Board: ${boardId}] Creating new User: ${userId}`);
    const entity = this.userRepo.create({ id: userId, board: { id: boardId }, role });
    const saved = await this.userRepo.save(entity);
    return this.toDto(saved);
  }

  async getUsers(boardId: string): Promise<RetroUser[]> {
    const userEntities = await this.userRepo.find({ where: { board: { id: boardId } } });
    return this.toDtos(userEntities);
  }

  async getActiveUsers(boardId: string): Promise<RetroUser[]> {
    const userEntities = await this.userRepo.find({
      where: {
        board: { id: boardId },
        sessionCount: MoreThan(0),
      },
    });
    return this.toDtos(userEntities);
  }

  async getUser(userId: string): Promise<RetroUser | undefined> {
    if (!userId) {
      throw new NotFoundError(`User with user id ${userId} not found.`);
    }

    const userEntity = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!userEntity) {
      this.logger.warn(`User with user id ${userId} not found.`);
      return undefined;
    }

    return this.toDto(userEntity);
  }

  private toDtos(entities: RetroUserEntity[]): RetroUser[] {
    return entities.map((user) => this.toDto(user));
  }

  private toDto(entity: RetroUserEntity): RetroUser {
    return {
      id: entity.id,
      boardId: entity.board.id,
      sessionCount: entity.sessionCount,
      role: entity.role,
    };
  }

  async userDisconnected(userId: string): Promise<void> {
    const userEntity = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!userEntity) return;

    userEntity.sessionCount = Math.max(0, (userEntity.sessionCount || 0) - 1);

    await this.userRepo.save(userEntity);
  }

  async userConnected(userId: string): Promise<void> {
    const userEntity = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!userEntity) return;

    userEntity.sessionCount = Math.max(0, (userEntity.sessionCount || 0) + 1);

    await this.userRepo.save(userEntity);
  }
}
