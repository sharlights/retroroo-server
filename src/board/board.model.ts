import { RetroList } from './lists/model/list.model';

export type RetroStage = 'headspace' | 'explore' | 'vote' | 'discuss' | 'done';

export class Board {
  constructor(
    private readonly id: string,
    private readonly createdDate: string,
    private readonly lists: RetroList[] = [],
    private readonly users: Map<string, User> = new Map(),
    private readonly stage: RetroStage,
  ) {}

  getStage(): RetroStage {
    return this.stage;
  }

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

  public clone(): Board {
    return new Board(this.id, this.createdDate, [...this.lists], new Map(this.users), this.stage);
  }

  cloneWith({
    id,
    createdDate,
    lists,
    users,
    stage,
  }: {
    id?: string;
    createdDate?: string;
    lists?: RetroList[];
    users?: Map<string, User>;
    stage?: RetroStage;
  }): Board {
    const clonedLists = (lists ?? this.getLists()).map((list) => {
      const newList = new RetroList();
      Object.assign(newList, {
        ...list,
        cards: list.cards.map((card) => ({ ...card })),
      });
      return newList;
    });

    const originalUsers = users ?? this.getUsers();
    const clonedUsers = new Map<string, User>();
    for (const [k, v] of originalUsers.entries()) {
      clonedUsers.set(k, new User(v.id, v.boardId, v.role));
    }

    return new Board(
      id ?? this.getId(),
      createdDate ?? this.getCreatedDate(),
      clonedLists,
      clonedUsers,
      stage ?? this.getStage(),
    );
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
