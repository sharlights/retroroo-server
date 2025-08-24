import { RetroStage } from '../types/stages';
import { RetroIntent } from '../intent/retro-intent.dto';

export interface RetroBoard {
  id: string;
  createdDate: Date;
  stage: RetroStage;
  intent: RetroIntent;
}
