import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetroIntentEntity } from './retro-intent.entity';
import { RetroIntent } from './retro-intent.dto';

@Injectable()
export class IntentService {
  constructor(
    @InjectRepository(RetroIntentEntity)
    private readonly intentRepo: Repository<RetroIntentEntity>,
  ) {}

  async getIntent(intentId: number): Promise<RetroIntent | null> {
    const entity = await this.intentRepo.findOneBy({ id: intentId });
    return entity ? this.toIntentDto(entity) : null;
  }

  public toIntentDto(intent: RetroIntentEntity): RetroIntent {
    return {
      id: intent.id,
      name: intent.name,
      description: intent.description,
    } as RetroIntent;
  }
}
