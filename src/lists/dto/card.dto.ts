export class CreateCardDto {
  boardId: string;
  listId: string;
  message: string;
}

export class DeleteCardDto {
  boardId: string;
  listId: string;
  cardId: string;
}

export class UpdateCardDto {
  boardId: string;
  listId: string;
  cardId: string;
  message: string;
}

export class MoveCardDto {
  boardId: string;
  fromListId: string;
  toListId: string;
  cardId: string;
  targetIndex: number;
}
