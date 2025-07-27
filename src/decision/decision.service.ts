import { Injectable } from '@nestjs/common';
import { RetroUser } from '../board/users/retro-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroDecisionEntity } from './retro-decision.entity';
import { RetroDecisionDto } from './retro-decision.dto';

@Injectable()
export class DecisionService {
  constructor(
    @InjectRepository(RetroDecisionEntity)
    private readonly decisionRepo: Repository<RetroDecisionEntity>,
  ) {}

  async createDecision(description: string, user: RetroUser) {
    const newAction = await this.decisionRepo.save({
      description,
      createdBy: { id: user.id },
      board: { id: user.boardId },
    });
    return this.toDecisionDto(newAction);
  }

  async getAll(user: RetroUser) {
    const actions = await this.decisionRepo.find({
      where: {
        board: { id: user.boardId },
      },
      order: { createdAt: 'ASC' },
    });

    return actions.map(this.toDecisionDto);
  }

  public toDecisionDto(action: RetroDecisionEntity): RetroDecisionDto {
    return {
      id: action.id,
      description: action.description,
      createdBy: action.createdBy.id,
    } as RetroDecisionDto;
  }
}
