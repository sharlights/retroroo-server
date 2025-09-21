import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RetroListEntity } from './retro-list.entity';
import { RetroUser } from '../users/retro-user.dto';
import { RetroList } from './retro-list.dto';
import { ListViewMapper } from './list-view-mapper';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(
    @InjectRepository(RetroListEntity)
    private readonly listRepo: Repository<RetroListEntity>,
    private readonly listViewMapper: ListViewMapper,
  ) {}

  async getBoardLists(boardId: string): Promise<RetroList[]> {
    if (boardId) {
      const entities = await this.listRepo.find({
        where: { board: { id: boardId } },
        relations: ['cards'],
      });
      return entities.map((e) => this.listViewMapper.toDto(e));
    }
  }

  async createList(newList: Partial<RetroList>, user: RetroUser): Promise<RetroList> {
    if (user.role !== 'facilitator' || user.boardId !== newList.boardId) {
      throw new ForbiddenException('Invalid Permissions');
    }

    const entity = this.listRepo.create({
      title: newList.title,
      subtitle: newList.subtitle,
      colour: newList.colour,
      order: newList.order,
      board: { id: user.boardId },
      cards: [],
    });

    const saved = await this.listRepo.save(entity);
    return this.listViewMapper.toDto(saved);
  }

  async updateList(update: Partial<RetroList>, user: RetroUser): Promise<RetroList> {
    if (user.role !== 'facilitator') throw new ForbiddenException('Invalid Permissions');

    const list = await this.listRepo.findOneOrFail({ where: { id: update.id, board: { id: user.boardId } } });

    // Assign only updatable fields
    if (update.title !== undefined) list.title = update.title;
    if (update.subtitle !== undefined) list.subtitle = update.subtitle;
    if (update.colour !== undefined) list.colour = update.colour;
    if (update.order !== undefined) list.order = update.order;

    const saved = await this.listRepo.save(list);
    return this.listViewMapper.toDto(saved);
  }

  async deleteList(boardId: string, listId: string, user: RetroUser): Promise<void> {
    if (user.role !== 'facilitator' || user.boardId !== boardId) throw new ForbiddenException('Invalid Permissions');
    await this.listRepo.delete({ id: listId, board: { id: boardId } });
  }

}
