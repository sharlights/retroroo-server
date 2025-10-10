import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ActionCreateRequest,
  CreateCardRequest,
  DecisionCreateRequest,
  DeleteCardRequest,
  MoveCardRequest,
  SelectIntentRequest,
  UpdateCardRequest,
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
} from './events.model.dto';
import { IntentService } from '../intent/intent.service';
import { IsRole } from './guards/is-role.guard';
import { BoardExistsAndUserIsConnected } from './guards/board-exists.service';
import { CardBelongsToBoardGuard } from './guards/card/card-belongs-to-board-guard.service';
import { CardIsOwnerOrFacilitator } from './guards/card/card-is-owner-or-facilitator';

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

  @UseGuards(BoardExistsAndUserIsConnected)
  @SubscribeMessage('list:card:create')
  async handleCreateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: CreateCardRequest) {
    const user: RetroUser = socket.data.user;
    // Check that the card belongs to the list.
    const board = await this.boardService.getBoard(user.boardId);
    const list = board.lists.find((l) => l.id === request.listId);
    if (!list) {
      this.logger.warn(
        `[Board: ${board.id}] User ${socket.data.user.id} attempted to create a card in list ${request.listId} which does not exist.`,
      );
      throw new Error('List does not exist in your board');
    }

    const card = await this.cardsService.createCard(request.listId, request.message, user, request.clientId);

    // Ensure card exists in board
    this.logger.log(`[Board: ${user.boardId}] Card created: Id: ${card.id} - Rank: ${card.orderRank}`);
    this.server.to(user.boardId).emit('list:card:created', { card: card } as CardCreatedEvent);
  }

  @UseGuards(BoardExistsAndUserIsConnected, CardBelongsToBoardGuard, CardIsOwnerOrFacilitator)
  @SubscribeMessage('list:card:delete')
  async handleDeleteCard(@ConnectedSocket() socket: Socket, @MessageBody() request: DeleteCardRequest) {
    const user: RetroUser = socket.data.user;
    const card: RetroCard = await this.cardsService.getCard(request.cardId);
    if (!card) throw Error('Card not found');

    await this.cardsService.deleteCard(request.cardId);
    this.server.to(user.boardId).emit('list:card:deleted', {
      cardId: request.cardId,
    } as CardDeletedEvent);
  }

  @UseGuards(CardBelongsToBoardGuard, BoardExistsAndUserIsConnected, CardIsOwnerOrFacilitator)
  @SubscribeMessage('list:card:update')
  async handleUpdateCard(@ConnectedSocket() socket: Socket, @MessageBody() request: UpdateCardRequest) {
    const user: RetroUser = socket.data.user;

    const updatedCard = await this.cardsService.updateCard(request.cardId, { message: request.message }, user);

    this.server.to(user.boardId).emit('list:card:updated', {
      card: updatedCard,
    } as CardUpdatedEvent);
  }

  @UseGuards(BoardExistsAndUserIsConnected, CardBelongsToBoardGuard)
  @SubscribeMessage('list:card:move')
  async handleMoveCard(@ConnectedSocket() socket: Socket, @MessageBody() request: MoveCardRequest) {
    const user: RetroUser = socket.data.user;

    const board = await this.boardService.getBoard(user.boardId);

    // Check list
    const list = board.lists.find((l) => l.id === request.toListId);
    if (!list) {
      this.logger.warn(
        `[Board: ${board.id}] User ${user.id} attempted to move a card to list ${request.toListId} which does not exist.`,
      );
      throw new Error('List does not exist in your board');
    }

    // Check above card and below card are in the same list or null
    if (request.aboveCardId) {
      const aboveCard = await this.cardsService.getCard(request.aboveCardId);
      if (aboveCard.listId !== list.id) {
        this.logger.warn(
          `[Board: ${board.id}] User ${user.id} attempted to move a card above card ${request.aboveCardId} which is not in list ${list.id}.`,
        );
        throw new Error('Above card is not in the target list');
      }
    }

    if (request.belowCardId) {
      const belowCard = await this.cardsService.getCard(request.belowCardId);
      if (belowCard.listId !== list.id) {
        this.logger.warn(
          `[Board: ${board.id}] User ${user.id} attempted to move a card below card ${request.belowCardId} which is not in list ${list.id}.`,
        );
        throw new Error('Below card is not in the target list');
      }
    }

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

  @UseGuards(BoardExistsAndUserIsConnected)
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

  @UseGuards(BoardExistsAndUserIsConnected)
  @SubscribeMessage('lists:get')
  async handleGetState(@ConnectedSocket() socket: Socket) {
    const boardId: string = socket.data.boardId;
    this.logger.log(`[Board: ${boardId}] Get Lists`);
    return await this.listService.getBoardLists(boardId);
  }

  @UseGuards(BoardExistsAndUserIsConnected)
  @SubscribeMessage('action:create')
  async handleCreateAction(@ConnectedSocket() socket: Socket, @MessageBody() request: ActionCreateRequest) {
    this.logger.log('Action create card', request);
    const user: RetroUser = socket.data.user;
    const newAction: RetroAction = await this.actionService.createAction(request.description, user);
    this.server.to(user.boardId).emit('action:created', { action: newAction } as ActionUpdatedEvent);
  }

  @UseGuards(BoardExistsAndUserIsConnected)
  @SubscribeMessage('decision:create')
  async handleCreateDecision(@ConnectedSocket() socket: Socket, @MessageBody() request: DecisionCreateRequest) {
    this.logger.log('decision created', request);
    const user: RetroUser = socket.data.user;
    const newDecision: RetroAction = await this.decisionService.createDecision(request.description, user);
    this.server.to(user.boardId).emit('decision:created', { decision: newDecision } as DecisionUpdatedEvent);
  }

  @UseGuards(BoardExistsAndUserIsConnected)
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
