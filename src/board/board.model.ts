import { RetroList } from '../lists/model/list.model';
import { Participant } from './participant.mode';

export class Board {
  id: string;
  createdDate: string;
  lists: RetroList[];

  /** who’s in this retro group */
  participants: Participant[];
}
