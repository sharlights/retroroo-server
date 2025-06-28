import { RetroCard } from '../card/retro-card.dto';

export interface RetroList {
  id: string;
  title: string;
  subtitle: string;
  colour: string;
  order: number;
  boardId: string;
  cards: RetroCard[];
}
