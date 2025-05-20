export class CreateCardDto {
  clientId: string;
  listId: string;
  message: string;
}

export class DeleteCardDto {
  listId: string;
  cardId: string;
}

export class UpdateCardDto {
  listId: string;
  cardId: string;
  message: string;
}

export class MoveCardDto {
  fromListId: string;
  toListId: string;
  cardId: string;
  targetIndex: number;
}
