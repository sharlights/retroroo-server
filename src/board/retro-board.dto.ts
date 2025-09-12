import { RetroStage } from '../types/stages';
import { RetroIntent } from '../intent/retro-intent.dto';
import { RetroList } from './lists/retro-list.dto';

export interface RetroBoard {
  id: string;
  createdDate: Date;
  stage: RetroStage;
  intention: RetroIntent;
  lists: RetroList[];
}
