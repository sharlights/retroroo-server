import { Module } from '@nestjs/common';
import { CardsGateway } from './cards.gateway';
import { CardsService } from './cards.service';

@Module({
  providers: [CardsGateway, CardsService],
})
export class CardsModule {}