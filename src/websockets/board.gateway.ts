import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ActionCreateRequest,
  CreateCardRequest,
  CreateListRequest,
  DecisionCreateRequest,
  DeleteCardRequest,
  DeleteListRequest,
  SelectIntentRequest,
  MoveCardRequest,
  UpdateCardRequest,
  UpdateListRequest,
  VoteForCardRequest,
} from './request.model.dto';
import { RetroUser } from '../board/users/retro-user.dto';
import { CardsService } from '../board/card/cards.service';
import { DecisionService } from '../decision/decision.service';
import { ListService } from '../board/lists/list.service';
import { ActionsService } from '../actions/actions.service';
import { BoardService } from '../board/board.service';
import { RetroIntent } from '../intent/retro-intent.dto';
import { RetroAction } from '../actions/retro-action';
import { TemplateService } from '../board/template/retro-template.service';
import { RetroCard } from '../board/card/retro-card.dto';
import {
  ActionUpdatedEvent,
  BoardUpdatedEvent,
  CardCreatedEvent,
  CardDeletedEvent,
  CardUpdatedEvent,
  DecisionUpdatedEvent,
  ListDeletedEvent,
  ListsUpdatedEvent,
} from './events.model.dto';
import { IntentService } from '../intent/intent.service';
import { IsRole } from './guards/is-role.guard';
import { BoardExists } from './guards/board-exists.service';
import { CardBelongsToBoardGuard } from './guards/card/card-belongs-to-board-guard.service';

@WebSocketGateway()
export class BoardGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(BoardGateway.name);
  constructor(
    private readonly cardsService: CardsService,
    private readonly decisionService: DecisionService,
    private readonly listService: ListService,
    private readonly actionService: ActionsService,
    private readonly boardService: BoardService,
    private readonly templateService: TemplateService,
    private readonly intentService: IntentService,
  ) {}

  @UseGuards(BoardExists)
  @SubscribeMessage('list:card:create')
  async handleCreateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: CreateCardRequest) {
    const user: RetroUser = socket.data.user;
    const card = await this.cardsService.createCard(request.listId, request.message, user, request.clientId);
    this.logger.log(`[Board: ${user.boardId}] Card created: Id: ${card.id} - Rank: ${card.orderRank}`);
    this.server.to(user.boardId).emit('list:card:created', { card: card } as CardCreatedEvent);
  }

  @SubscribeMessage('list:card:delete')
  async handleDeleteCard(@ConnectedSocket() socket: Socket, @MessageBody() request: DeleteCardRequest) {
    const user: RetroUser = socket.data.user;
    const card: RetroCard = await this.cardsService.getCard(request.cardId);
    if (!card) throw Error('Card not found');

    const boardId = user.boardId;
    const isOwner = user.id === card.creatorId;
    const isFacilitator = user.role == 'facilitator';


    if (card.boardId !== boardId) {
      this.logger.warn(
        `[Board: ${boardId}] User ${user.id} attempted to delete card ${card.id} which does not belong to their board.`,
      );
      throw new Error('Card not found in your board');
    }

    if (!isOwner && !isFacilitator) {
      this.logger.warn(`[Board: ${boardId}] User ${user.id} attempted to delete card ${card.id} without permissions.`);
      throw new Error('Invalid permissions to delete card');
    }

    await this.cardsService.deleteCard(request.cardId);
    this.server.to(user.boardId).emit('list:card:deleted', {
      cardId: request.cardId,
    } as CardDeletedEvent);
  }

  @UseGuards(BoardExists)
  @UseGuards(CardBelongsToBoardGuard)
  @SubscribeMessage('list:card:update')
  async handleUpdateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateCardRequest) {
    const user: RetroUser = socket.data.user;

    // Anyone can update a card.
    const updatedCard = await this.cardsService.updateCard(request.cardId, { message: request.message }, user);

    this.server.to(user.boardId).emit('list:card:updated', {
      card: updatedCard,
    } as CardUpdatedEvent);
  }

  @UseGuards(BoardExists)
  @UseGuards(CardBelongsToBoardGuard)
  @SubscribeMessage('list:card:move')
  async handleMoveCard(@ConnectedSocket() socket: Socket, @MessageBody() request: MoveCardRequest) {
    const user: RetroUser = socket.data.user;

    // All the cards between the old and new index require an update as their index will be changed.
    const updatedCard = await this.cardsService.moveCard(
      request.cardId,
      request.toListId,
      request.aboveCardId,
      request.belowCardId,
      user,
    );

    this.server.to(user.boardId).emit('list:card:updated', {
      card: updatedCard,
    } as CardUpdatedEvent);
  }

  @UseGuards(BoardExists)
  @UseGuards(CardBelongsToBoardGuard)
  @SubscribeMessage('list:card:vote')
  async handleVoteFor(@ConnectedSocket() socket: Socket, @MessageBody() request: VoteForCardRequest) {
    const user: RetroUser = socket.data.user;
    await this.cardsService.saveCardVotes(request.cardId, user.id, request.voteDelta);

    //TODO - restrict number of votes per person

    const updatedCard = await this.cardsService.getCard(request.cardId);
    this.logger.log(`[Board: ${user.boardId}] User ${user.id} voted for card: ${updatedCard.id}`);
    this.server.to(user.boardId).emit('list:card:updated', {
      card: updatedCard,
    } as CardUpdatedEvent);
  }

  // List Events
  @SubscribeMessage('list:create')
  async handleCreateList(@ConnectedSocket() socket: Socket, @MessageBody() request: CreateListRequest) {
    const user: RetroUser = socket.data.user;
    const list = this.listService.createList(
      {
        title: request.title,
        subtitle: request.subtitle,
        boardId: request.boardId,
        order: request.order,
        colour: request.colour,
        cards: [],
      },
      user,
    );
    this.server.to(request.boardId).emit('list:created', list);
  }

  @SubscribeMessage('list:update')
  async handleUpdateList(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateListRequest) {
    const user: RetroUser = socket.data.user;

    const updatedList = await this.listService.updateList(
      {
        id: request.listId,
        title: request.title,
        subtitle: request.subtitle,
        boardId: user.boardId,
        order: request.order,
        colour: request.colour,
      },
      user,
    );
    this.server.to(request.boardId).emit('lists:updated', { lists: [updatedList] } as ListsUpdatedEvent);
  }

  @SubscribeMessage('list:delete')
  async handleDeleteList(@ConnectedSocket() socket: Socket, @MessageBody() request: DeleteListRequest) {
    const user: RetroUser = socket.data.user;
    await this.listService.deleteList(user.boardId, request.listId, user);
    this.server.to(user.boardId).emit('list:deleted', {
      listId: request.listId,
    } as ListDeletedEvent);
  }

  @SubscribeMessage('lists:get')
  async handleGetState(@ConnectedSocket() socket: Socket) {
    const boardId: string = socket.data.boardId;
    this.logger.log(`[Board: ${boardId}] Get Lists`);
    return await this.listService.getBoardLists(boardId);
  }

  @SubscribeMessage('action:create')
  async handleCreateAction(@ConnectedSocket() socket: Socket, @MessageBody() request: ActionCreateRequest) {
    this.logger.log('Action create card', request);
    const user: RetroUser = socket.data.user;
    const newAction: RetroAction = await this.actionService.createAction(request.description, user);
    this.server.to(user.boardId).emit('action:created', { action: newAction } as ActionUpdatedEvent);
  }

  @SubscribeMessage('decision:create')
  async handleCreateDecision(@ConnectedSocket() socket: Socket, @MessageBody() request: DecisionCreateRequest) {
    this.logger.log('decision created', request);
    const user: RetroUser = socket.data.user;
    const newDecision: RetroAction = await this.decisionService.createDecision(request.description, user);
    this.server.to(user.boardId).emit('decision:created', { decision: newDecision } as DecisionUpdatedEvent);
  }

  @UseGuards(IsRole('facilitator'))
  @SubscribeMessage('intent:select')
  async handleIntentSelected(@ConnectedSocket() socket: Socket, @MessageBody() request: SelectIntentRequest) {
    this.logger.log('intent selected', request);
    const user: RetroUser = socket.data.user;

    const selectedIntent: RetroIntent = await this.intentService.getIntent(request.selectedIntent);
    if (!selectedIntent) {
      this.logger.warn(
        `[Board: ${user.boardId}] User ${user.id} attempted to select intent ${request.selectedIntent} which does not exist.`,
      );
      throw new Error('Selected intent does not exist');
    }

    const boardId: string = socket.data.boardId;

    // Generate the retro workflow based on the selected intent. This will create setup the content
    // for the headspace and main board.
    const newLists = await this.templateService.createListsFromTemplate(boardId, selectedIntent);
    const updatedBoard = await this.boardService.updateBoard(boardId, {
      intention: selectedIntent,
      lists: newLists,
    });

    this.server.to(user.boardId).emit('board:updated', { board: updatedBoard } as BoardUpdatedEvent);
  }
}
