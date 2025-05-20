export class CreateListDto {
  boardId: string;
  name: string;
  title: string;
  subtitle: string;
  order: number;
  colour: string;
}

export class UpdateListDto {
  boardId: string;
  listId: string;
  title: string;
  subtitle: string;
  order: number;
  colour: string;
}

export class DeleteListDto {
  boardId: string;
  listId: string;
}
