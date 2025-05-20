import { Board } from '../../board.model';

export type ExerciseStatus = 'COMPLETED' | 'SELECTED' | 'IN_PROGRESS';

export abstract class HeadspaceExercise {
  exerciseId: string;
  board: Board;
  status: ExerciseStatus;

  public constructor(exerciseId: string, board: Board, status: ExerciseStatus) {
    this.exerciseId = exerciseId;
    this.board = board;
    this.status = status;
  }

  /** Called when facilitator starts the game */
  abstract start(onComplete: () => void): void;

  /** Called when facilitator stops mid-game */
  abstract stop(): void;

  /** Called when facilitator restarts */
  abstract reset(): void;

  /**
   * Handle any game-specific participant action.
   * @param userId  the player performing the action
   * @param action  e.g. 'submitWord', 'draw', 'choose'
   * @param payload any associated data
   */
  abstract handleAction(userId: string, action: string, payload: any): void;
}
