import { Injectable } from '@nestjs/common';
import { RetroUser } from '../board/users/retro-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroDecisionEntity } from './retro-decision.entity';
import { RetroDecision } from './retro.decision';

@Injectable()
export class DecisionService {
  constructor(
    @InjectRepository(RetroDecisionEntity)
    private readonly decisionRepo: Repository<RetroDecisionEntity>,
  ) {}

  async createDecision(description: string, user: RetroUser) {
    const newDecision = await this.decisionRepo.save({
      description,
      createdBy: { id: user.id },
      board: { id: user.boardId },
    });
    return this.toDecisionDto(newDecision);
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

  public toDecisionDto(action: RetroDecisionEntity): RetroDecision {
    return {
      id: action.id,
      description: action.description,
      createdBy: action.createdBy.id,
    } as RetroDecision;
  }
}
