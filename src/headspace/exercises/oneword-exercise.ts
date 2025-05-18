import { Board } from '../../board/board.model';
import { ExerciseStatus, HeadspaceExercise } from './exercise.model';

export class OneWordExercise implements HeadspaceExercise {
  readonly exerciseId = 'one-word';
  readonly board: Board;
  status: ExerciseStatus = 'SELECTED';

  private responses = new Map<string, string>();
  private onComplete!: () => void;

  constructor(board: Board) {
    this.board = board;
  }

  start(onComplete: () => void): void {
    this.status = 'IN_PROGRESS';
    this.responses.clear();
    this.onComplete = onComplete;
  }

  stop(): void {
    this.status = 'COMPLETED';
    this.responses.clear();
  }

  reset(): void {
    this.status = 'SELECTED';
    this.responses.clear();
  }

  handleAction(userId: string, action: string, payload: any): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error('Game not in progress');
    }

    switch (action) {
      case 'submitWord':
        if (this.responses.has(userId)) {
          throw new Error('Already submitted');
        }
        this.responses.set(userId, payload.word);
        // all participants submitted?
        if (this.responses.size === this.board.participants.length) {
          this.status = 'COMPLETED';
          this.onComplete();
        }
        break;

      default:
        throw new Error(`Unknown action '${action}'`);
    }
  }

  /** handy helper for gateway to surface results */
  getResults(): Record<string,string> {
    return Object.fromEntries(this.responses);
  }
}