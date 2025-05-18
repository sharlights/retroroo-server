export class Participant {
  /** unique user identifier */
  userId: string;
  /** display name (optional) */
  name?: string;

  constructor(userId: string, name?: string) {
    this.userId = userId;
    this.name = name;
  }
}
