import { Injectable } from '@nestjs/common';
import { Board } from '../board/board.model';
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
  private exercises = new Map<string, HeadspaceExercise>();

  constructor() {
    // Register built-in games here
    this.registry.set('one-word', (board) => new OneWordExercise(board));
  }

  selectExercise(board: Board, exerciseId: string): HeadspaceExercise {
    const exerciseFactory = this.registry.get(exerciseId);
    if (!exerciseFactory) throw new ExerciseNotFoundException();
    const exercise = exerciseFactory(board);
    this.exercises.set(board.id, exercise);
    return exercise;
  }

  startExercise(board: Board, onCompleteCallback: (boardId: string) => void): HeadspaceExercise {
    const exercise = this.exercises.get(board.id);

    if (!exercise || exercise.status !== 'SELECTED') {
      throw new ExerciseNotSelectedException();
    }

    exercise.status = 'IN_PROGRESS';
    exercise.start(() => {
      this.exercises.delete(board.id);
      onCompleteCallback(board.id);
    });
    return exercise;
  }

  stopExercise(board: Board): HeadspaceExercise {
    const exercise = this.exercises.get(board.id);
    if (!exercise) throw new ExerciseNotFoundException();
    exercise.stop();
    this.exercises.delete(board.id);
    return exercise;
  }

  resetExercise(board: Board): HeadspaceExercise {
    const old = this.exercises.get(board.id);
    if (!old) throw new ExerciseNotFoundException();
    const exerciseFactory = this.registry.get(old.exerciseId)!;
    const fresh = exerciseFactory(board);
    this.exercises.set(board.id, fresh);
    return fresh;
  }
}
