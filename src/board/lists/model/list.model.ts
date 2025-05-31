import { RetroCard } from './card.model';

export class RetroList {
  id?: string;
  title: string;
  subtitle: string;
  boardId: string;
  order: number;
  colour: string;
  cards: RetroCard[] = [];
}
