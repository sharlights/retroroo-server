import { BoardRole } from '../../types/roles';

export interface RetroUser {
  id: string;
  boardId: string;
  role: BoardRole;
  sessionCount: number;
}
