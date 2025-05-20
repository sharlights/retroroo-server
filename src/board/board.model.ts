import { RetroList } from './lists/model/list.model';

export class Board {
  constructor(
    private readonly id: string,
    private readonly createdDate: string,
    private readonly lists: RetroList[] = [],
    private readonly users: Map<string, User> = new Map(),
  ) {}

  getId(): string {
    return this.id;
  }

  getCreatedDate(): string {
    return this.createdDate;
  }

  getLists(): RetroList[] {
    return this.lists;
  }

  getUsers(): Map<string, User> {
    return this.users;
  }

  addUser(userId: string, user: User): void {
    this.users.set(userId, user);
  }
}

export type BoardRole = 'facilitator' | 'participant';

export class User {
  constructor(
    private _id: string,
    private _boardId: string,
    private _role: BoardRole,
  ) {}

  get id(): string {
    return this._id;
  }

  get boardId(): string {
    return this._boardId;
  }

  get role(): BoardRole {
    return this._role;
  }
}
