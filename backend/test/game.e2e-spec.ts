import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { GameState } from '../src/common/types/chess.types';

describe('Game API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  function createGame(): Promise<GameState> {
    return http()
      .post('/game')
      .expect(201)
      .then((res) => res.body as GameState);
  }

  function move(id: string, body: Record<string, unknown>) {
    return http().post(`/game/${id}/move`).send(body);
  }

  async function playMoves(
    id: string,
    moves: [string, string][],
  ): Promise<request.Response> {
    let res: request.Response | undefined;
    for (const [from, to] of moves) {
      res = await move(id, { from, to }).expect(201);
    }
    return res as request.Response;
  }

  describe('POST /game', () => {
    it('creates a game with the initial position', async () => {
      const state = await createGame();

      expect(state.id).toEqual(expect.any(String));
      expect(state.fen).toBe(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      );
      expect(state.turn).toBe('w');
      expect(state.status).toBe('in_progress');
      expect(state.inCheck).toBe(false);
      expect(state.moves).toHaveLength(0);
      expect(state.board).toHaveLength(8);
      expect(state.board.flat().filter(Boolean)).toHaveLength(32);
      expect(state.createdAt).toEqual(expect.any(String));
      expect(state.updatedAt).toEqual(expect.any(String));
    });

    it('exposes legal moves for the side to move', async () => {
      const state = await createGame();

      expect(state.legalMoves.e2).toEqual(expect.arrayContaining(['e3', 'e4']));
      expect(state.legalMoves.g1).toEqual(expect.arrayContaining(['f3', 'h3']));
      // it is white to move, so black has no legal moves yet
      expect(state.legalMoves.e7).toBeUndefined();
      // empty square has no legal moves
      expect(state.legalMoves.e4).toBeUndefined();
    });
  });

  describe('GET /game/:id', () => {
    it('returns the board state', async () => {
      const created = await createGame();

      const res = await http().get(`/game/${created.id}`).expect(200);

      expect(res.body).toEqual(expect.objectContaining<Partial<GameState>>({
        id: created.id,
        fen: created.fen,
        turn: 'w',
        status: 'in_progress',
        moves: [],
      }));
      expect(res.body.board[6][4]).toEqual({
        square: 'e2',
        type: 'p',
        color: 'w',
      });
      expect(res.body.board[0][4]).toEqual({
        square: 'e8',
        type: 'k',
        color: 'b',
      });
    });

    it('404s for an unknown game id', async () => {
      await http()
        .get('/game/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('400s for a malformed game id', async () => {
      await http().get('/game/not-a-uuid').expect(400);
    });
  });

  describe('POST /game/:id/move — legal moves', () => {
    it('applies a move and returns the updated state', async () => {
      const game = await createGame();

      const res = await move(game.id, { from: 'e2', to: 'e4' }).expect(201);

      expect(res.body.fen).toBe(
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      );
      expect(res.body.turn).toBe('b');
      expect(res.body.moves).toHaveLength(1);
      expect(res.body.moves[0]).toEqual(
        expect.objectContaining({
          from: 'e2',
          to: 'e4',
          san: 'e4',
          color: 'w',
          piece: 'p',
        }),
      );
      expect(res.body.legalMoves.e7).toEqual(
        expect.arrayContaining(['e6', 'e5']),
      );
      expect(res.body.legalMoves.e2).toBeUndefined();
    });

    it('persists the move history across requests', async () => {
      const game = await createGame();
      await playMoves(game.id, [
        ['e2', 'e4'],
        ['e7', 'e5'],
      ]);

      const res = await http().get(`/game/${game.id}`).expect(200);

      expect(res.body.moves.map((m: { san: string }) => m.san)).toEqual([
        'e4',
        'e5',
      ]);
      expect(res.body.turn).toBe('w');
    });

    it('handles castling', async () => {
      const game = await createGame();
      await playMoves(game.id, [
        ['e2', 'e4'],
        ['e7', 'e5'],
        ['g1', 'f3'],
        ['b8', 'c6'],
        ['f1', 'c4'],
        ['g8', 'f6'],
      ]);

      const res = await move(game.id, { from: 'e1', to: 'g1' }).expect(201);

      expect(res.body.fen).toBe(
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4',
      );
      expect(res.body.moves.at(-1)).toEqual(
        expect.objectContaining({ san: 'O-O', flags: 'k' }),
      );
    });

    it('promotes a pawn with an explicit promotion piece', async () => {
      const game = await createGame();
      await playMoves(game.id, [
        ['a2', 'a4'],
        ['b7', 'b5'],
        ['a4', 'b5'],
        ['a7', 'a6'],
        ['b5', 'a6'],
        ['h7', 'h6'],
        ['a6', 'a7'],
        ['h6', 'h5'],
      ]);

      const res = await move(game.id, {
        from: 'a7',
        to: 'b8',
        promotion: 'q',
      }).expect(201);

      expect(res.body.moves.at(-1)).toEqual(
        expect.objectContaining({
          san: 'axb8=Q',
          promotion: 'q',
          captured: 'n',
        }),
      );
      expect(res.body.board.flat()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ square: 'b8', type: 'q', color: 'w' }),
        ]),
      );
    });

    it('detects checkmate', async () => {
      const game = await createGame();

      const res = await playMoves(game.id, [
        ['f2', 'f3'],
        ['e7', 'e5'],
        ['g2', 'g4'],
        ['d8', 'h4'],
      ]);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('checkmate');
      expect(res.body.inCheck).toBe(true);
      expect(res.body.legalMoves).toEqual({});
      expect(res.body.moves.at(-1)?.san).toBe('Qh4#');
    });
  });

  describe('POST /game/:id/move — illegal moves', () => {
    it('400s when the piece cannot move that way', async () => {
      const game = await createGame();

      const res = await move(game.id, { from: 'e2', to: 'e5' }).expect(400);

      expect(res.body.message).toContain('Illegal move');
    });

    it('400s when moving an empty square', async () => {
      const game = await createGame();

      await move(game.id, { from: 'e4', to: 'e5' }).expect(400);
    });

    it('400s when moving out of turn', async () => {
      const game = await createGame();
      await move(game.id, { from: 'e2', to: 'e4' }).expect(201);

      await move(game.id, { from: 'e2', to: 'e4' }).expect(400);
    });

    it('400s when jumping with a pawn onto a piece', async () => {
      const game = await createGame();
      await playMoves(game.id, [
        ['e2', 'e4'],
        ['e7', 'e5'],
      ]);

      await move(game.id, { from: 'e4', to: 'e5' }).expect(400);
    });

    it('404s for an unknown game', async () => {
      await move('00000000-0000-4000-8000-000000000000', {
        from: 'e2',
        to: 'e4',
      }).expect(404);
    });
  });

  describe('POST /game/:id/move — request validation', () => {
    it('400s on a malformed square', async () => {
      const game = await createGame();

      const res = await move(game.id, { from: 'z9', to: 'e4' }).expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining(['from must be a square like "e2"']),
      );
    });

    it('400s on a missing field', async () => {
      const game = await createGame();

      await move(game.id, { to: 'e4' }).expect(400);
    });

    it('400s on an unknown field', async () => {
      const game = await createGame();

      await move(game.id, { from: 'e2', to: 'e4', hack: true }).expect(400);
    });

    it('400s on an invalid promotion piece', async () => {
      const game = await createGame();

      await move(game.id, {
        from: 'e2',
        to: 'e4',
        promotion: 'k',
      }).expect(400);
    });

    it('400s for a malformed game id', async () => {
      await move('nope', { from: 'e2', to: 'e4' }).expect(400);
    });
  });
});
