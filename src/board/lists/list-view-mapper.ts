import { Injectable } from '@nestjs/common';
import { RetroListEntity } from './retro-list.entity';
import { RetroList } from './retro-list.dto';
import { CardViewMapper } from '../card/card-view-mapper';

@Injectable()
export class ListViewMapper {
  constructor(private readonly cardViewMapper: CardViewMapper) {}

  public toDto(entity: RetroListEntity): RetroList {
    return {
      id: entity.id,
      title: entity.title,
      subtitle: entity.subtitle,
      colour: entity.colour,
      order: entity.order,
      boardId: entity.board?.id,
      cards: entity.cards ? this.cardViewMapper.toCardDtos(entity.cards) : [],
    };
  }
  public toListDtos(lists: RetroListEntity[]): RetroList[] {
    if (!lists || lists.length === 0) return [];
    return lists.map((list) => {
      return this.toDto(list);
    });
  }
}
