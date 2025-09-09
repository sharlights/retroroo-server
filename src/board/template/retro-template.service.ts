import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroTemplateEntity } from './retro-template.entity';
import { ListService } from '../lists/list.service';
import { RetroList } from '../lists/retro-list.dto';
import { RetroBoard } from '../retro-board.dto';
import { RetroTemplateListEntity } from './retro-template-list.entity';
import { RetroUser } from '../users/retro-user.dto';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    @InjectRepository(RetroTemplateEntity)
    private readonly templateRepo: Repository<RetroTemplateEntity>,
    @InjectRepository(RetroTemplateListEntity)
    private readonly templateListsRepo: Repository<RetroTemplateListEntity>,
    private readonly listService: ListService,
  ) {}

  public async createListsFromTemplate(board: RetroBoard, user: RetroUser) {
    if (board.intention == null) throw new ForbiddenException('Unable to setup board without an intention');

    // Fetch a board template based on the intention.
    const templates = await this.templateRepo.find({
      where: { intention: { id: board.intention.id }, isActive: true },
      relations: ['intention'],
    });

    if (templates.length == 0) throw new ForbiddenException('No templates found');

    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    this.logger.log(`Board[${board.id}] - Selected Template: ${selectedTemplate.name}`);

    // Create lists from the template
    const lists: RetroList[] = [];

    const templateLists = await this.templateListsRepo.find({
      where: { template: { id: selectedTemplate.id } },
      relations: ['template'],
      order: { order: 'ASC' },
    });

    for (const templateList of templateLists) {
      const newList = await this.listService.createList(
        {
          title: templateList.title,
          subtitle: templateList.subtitle,
          colour: templateList.colour,
          order: templateList.order,
          boardId: board.id,
        },
        user,
      );
      lists.push(newList);
    }
    return lists;
  }
}
