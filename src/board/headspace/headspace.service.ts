import { Injectable } from '@nestjs/common';
import { Board } from '../board.model';
import { HeadspaceExercise } from './exercises/exercise.model';
import { OneWordExercise } from './exercises/oneword-exercise';

export class ExerciseNotSelectedException extends Error {
  constructor() {
    super('No exercise selected.');
    this.name = 'ExerciseNotSelectedException';
  }
}

export class ExerciseNotInProgressException extends Error {
  constructor() {
    super('No exercise in progress.');
    this.name = 'ExerciseNotInProgressException';
  }
}

export class ExerciseNotFoundException extends Error {
  constructor() {
    super('Exercise was not found.');
    this.name = 'ExerciseNotFoundException';
  }
}

type ExerciseFactory = (board: Board) => HeadspaceExercise;

@Injectable()
export class HeadspaceService {
  /** Map of exerciseId → factory for creating a new game */
  private registry = new Map<string, ExerciseFactory>();
  /** One active game instance per board.id */
  private activeExercises = new Map<string, HeadspaceExercise>();

  constructor() {
    // Register built-in games here
    this.registry.set('one-word', (board) => new OneWordExercise(board));
  }

  selectExercise(board: Board, exerciseId: string): HeadspaceExercise {
    const exerciseFactory = this.registry.get(exerciseId);
    if (!exerciseFactory) throw new ExerciseNotFoundException();
    const exercise = exerciseFactory(board);
    this.activeExercises.set(board.getId(), exercise);
    return exercise;
  }

  startExercise(board: Board, onCompleteCallback: (boardId: string) => void): HeadspaceExercise {
    const exercise = this.activeExercises.get(board.getId());

    if (!exercise || exercise.status !== 'SELECTED') {
      throw new ExerciseNotSelectedException();
    }

    exercise.start(() => {
      this.activeExercises.delete(board.getId());
      onCompleteCallback(board.getId());
    });
    return exercise;
  }

  stopExercise(board: Board): HeadspaceExercise {
    const exercise = this.activeExercises.get(board.getId());
    if (!exercise) throw new ExerciseNotFoundException();
    exercise.stop();
    this.activeExercises.delete(board.getId());
    return exercise;
  }

  resetExercise(board: Board): HeadspaceExercise {
    const exercise = this.activeExercises.get(board.getId());
    if (!exercise) throw new ExerciseNotFoundException();
    exercise.reset();
    return exercise;
  }

  getActiveExercise(boardId: string): HeadspaceExercise {
    const exercise = this.activeExercises.get(boardId);
    if (!exercise) {
      throw new ExerciseNotSelectedException();
    }
    return exercise;
  }
}
