import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroStage } from '../../types/stages';
import { RetroStageFinishedEntity } from './retro-stage-finished.entity';

@Injectable()
export class StageService {
  constructor(
    @InjectRepository(RetroStageFinishedEntity)
    private readonly finishedRep: Repository<RetroStageFinishedEntity>,
  ) {}

  async updateFinished(userId: string, boardId: string, stage: RetroStage, finished: boolean) {
    if (finished) {
      await this.finishedRep
        .createQueryBuilder()
        .insert()
        .into(RetroStageFinishedEntity)
        .values({ user: { id: userId }, board: { id: boardId }, stage })
        .orIgnore() // prevents duplicate insert due to @Unique
        .execute();
    } else {
      await this.finishedRep
        .createQueryBuilder()
        .delete()
        .where('board.id = :boardId', { boardId })
        .andWhere('user.id = :userId', { userId })
        .andWhere('stage = :stage', { stage })
        .execute();
    }
  }

  /**
   * Returns all finished users on the stage.
   * @param boardId
   * @param stage
   */
  async getFinished(boardId: string, stage: RetroStage): Promise<string[]> {
    const records = await this.finishedRep.find({
      where: {
        board: { id: boardId },
        stage,
      },
      relations: ['user', 'board'],
    });
    return records.map((r) => r.user.id);
  }
}
