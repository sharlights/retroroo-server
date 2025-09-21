export class RetroCard {
  id?: string;
  listId: string;
  orderRank: string;
  creatorId: string;
  /* The client id is the unique id that was created on the client app */
  clientId: string;
  message: string;
  votes: { [userId: string]: number };
}
