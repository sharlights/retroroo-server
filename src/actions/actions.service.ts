import { Injectable } from '@nestjs/common';
import { RetroUser } from '../board/users/retro-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroActionEntity } from './retro-action.entity';
import { RetroAction } from './retro-action';

@Injectable()
export class ActionsService {
  constructor(
    @InjectRepository(RetroActionEntity)
    private readonly actionRepo: Repository<RetroActionEntity>,
  ) {}

  async createAction(description: string, user: RetroUser) {
    const newAction = await this.actionRepo.save({
      description: description.trim().slice(0, 2000), //TODO make this configurable
      createdBy: { id: user.id },
      board: { id: user.boardId },
    });
    return this.toActionDto(newAction);
  }

  async getAll(user: RetroUser) {
    const actions = await this.actionRepo.find({
      where: {
        board: { id: user.boardId },
      },
      order: { createdAt: 'ASC' },
    });

    return actions.map(this.toActionDto);
  }

  public toActionDto(action: RetroActionEntity): RetroAction {
    return {
      id: action.id,
      description: action.description,
      createdBy: action.createdBy.id,
    } as RetroAction;
  }
}
