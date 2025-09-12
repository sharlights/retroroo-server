import { Injectable } from '@nestjs/common';
import { RetroBoardEntity } from './retro-board.entity';
import { RetroBoard } from './retro-board.dto';
import { ListViewMapper } from './lists/list-view-mapper';

@Injectable()
export class BoardViewMapper {
  constructor(private readonly listViewMapper: ListViewMapper) {}

  public toDto(entity: RetroBoardEntity): RetroBoard {
    return {
      id: entity.id,
      createdDate: entity.createdDate,
      stage: entity.stage,
      intention: entity.intention,
      lists: this.listViewMapper.toListDtos(entity.lists),
    };
  }
}
