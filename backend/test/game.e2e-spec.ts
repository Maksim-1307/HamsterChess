import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PublicUser } from '../src/auth/auth.types';
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
  const PASSWORD = 'password123';

  async function createSession() {
    const session = request.agent(app.getHttpServer());
    const username = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const res = await session
      .post('/auth/register')
      .send({ username, password: PASSWORD })
      .expect(201);
    return { session, user: res.body as PublicUser };
  }

  // creator plays white, joiner plays black
  async function setupGame() {
    const creator = await createSession();
    const joiner = await createSession();

    const created = await creator.session
      .post('/game')
      .send({ color: 'w' })
      .expect(201);
    const id = created.body.id as string;

    const joined = await joiner.session.post(`/game/${id}/join`).expect(201);

    return { creator, joiner, id, state: joined.body as GameState };
  }

  describe('authentication', () => {
    it('401s creating a game without a session', async () => {
      await http().post('/game').send({}).expect(401);
    });

    it('401s reading a game without a session', async () => {
      await http()
        .get('/game/00000000-0000-4000-8000-000000000000')
        .expect(401);
    });
  });

  describe('POST /game', () => {
    it('creates a game and seats the creator as white by default', async () => {
      const { session, user } = await createSession();

      const res = await session.post('/game').send({}).expect(201);
      const state = res.body as GameState;

      expect(state.id).toEqual(expect.any(String));
      expect(state.fen).toBe(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      );
      expect(state.turn).toBe('w');
      expect(state.status).toBe('in_progress');
      expect(state.players).toEqual({ white: user.id, black: null });
      expect(state.moves).toHaveLength(0);
      expect(state.board.flat().filter(Boolean)).toHaveLength(32);
    });

    it('seats the creator as black when requested', async () => {
      const { session, user } = await createSession();

      const res = await session
        .post('/game')
        .send({ color: 'b' })
        .expect(201);

      expect((res.body as GameState).players).toEqual({
        white: null,
        black: user.id,
      });
    });

    it('400s on an invalid color', async () => {
      const { session } = await createSession();

      await session.post('/game').send({ color: 'x' }).expect(400);
    });

    it('exposes legal moves for the side to move', async () => {
      const { session } = await createSession();
      const res = await session.post('/game').send({}).expect(201);
      const state = res.body as GameState;

      expect(state.legalMoves.e2).toEqual(expect.arrayContaining(['e3', 'e4']));
      expect(state.legalMoves.g1).toEqual(expect.arrayContaining(['f3', 'h3']));
      expect(state.legalMoves.e7).toBeUndefined();
    });
  });

  describe('POST /game/:id/join', () => {
    it('seats a second player in the open slot', async () => {
      const creator = await createSession();
      const joiner = await createSession();

      const created = await creator.session
        .post('/game')
        .send({ color: 'w' })
        .expect(201);

      const res = await joiner.session
        .post(`/game/${created.body.id}/join`)
        .expect(201);

      expect((res.body as GameState).players).toEqual({
        white: creator.user.id,
        black: joiner.user.id,
      });
    });

    it('is idempotent for an existing player', async () => {
      const { creator, id } = await setupGame();

      await creator.session.post(`/game/${id}/join`).expect(201);
    });

    it('409s when the game is already full', async () => {
      const { id } = await setupGame();
      const stranger = await createSession();

      await stranger.session.post(`/game/${id}/join`).expect(409);
    });
  });

  describe('GET /game/:id', () => {
    it('lets a participant read the board state', async () => {
      const { creator, id, state } = await setupGame();

      const res = await creator.session.get(`/game/${id}`).expect(200);

      expect(res.body).toEqual(
        expect.objectContaining<Partial<GameState>>({
          id: state.id,
          fen: state.fen,
          turn: 'w',
          status: 'in_progress',
        }),
      );
      expect(res.body.board[6][4]).toEqual({
        square: 'e2',
        type: 'p',
        color: 'w',
      });
    });

    it('403s for a user who is not a participant', async () => {
      const { id } = await setupGame();
      const stranger = await createSession();

      await stranger.session.get(`/game/${id}`).expect(403);
    });

    it('404s for an unknown game id', async () => {
      const { session } = await createSession();

      await session
        .get('/game/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('400s for a malformed game id', async () => {
      const { session } = await createSession();

      await session.get('/game/not-a-uuid').expect(400);
    });
  });

  describe('POST /game/:id/move', () => {
    it('applies a move and returns the updated state', async () => {
      const { creator, id } = await setupGame();

      const res = await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'e2', to: 'e4' })
        .expect(201);

      expect(res.body.fen).toBe(
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      );
      expect(res.body.turn).toBe('b');
      expect(res.body.moves[0]).toEqual(
        expect.objectContaining({
          from: 'e2',
          to: 'e4',
          san: 'e4',
          color: 'w',
          piece: 'p',
        }),
      );
    });

    it('403s when it is not the player turn', async () => {
      const { joiner, id } = await setupGame();

      const res = await joiner.session
        .post(`/game/${id}/move`)
        .send({ from: 'e7', to: 'e5' })
        .expect(403);

      expect(res.body.message).toContain('not your turn');
    });

    it('403s for a non-participant', async () => {
      const { id } = await setupGame();
      const stranger = await createSession();

      await stranger.session
        .post(`/game/${id}/move`)
        .send({ from: 'e2', to: 'e4' })
        .expect(403);
    });

    it('404s for an unknown game', async () => {
      const { session } = await createSession();

      await session
        .post('/game/00000000-0000-4000-8000-000000000000/move')
        .send({ from: 'e2', to: 'e4' })
        .expect(404);
    });

    it('handles castling', async () => {
      const { creator, joiner, id } = await setupGame();

      const sequence: [typeof creator.session, string, string][] = [
        [creator.session, 'e2', 'e4'],
        [joiner.session, 'e7', 'e5'],
        [creator.session, 'g1', 'f3'],
        [joiner.session, 'b8', 'c6'],
        [creator.session, 'f1', 'c4'],
        [joiner.session, 'g8', 'f6'],
      ];
      for (const [session, from, to] of sequence) {
        await session.post(`/game/${id}/move`).send({ from, to }).expect(201);
      }

      const res = await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'e1', to: 'g1' })
        .expect(201);

      expect(res.body.fen).toBe(
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4',
      );
      expect(res.body.moves.at(-1)).toEqual(
        expect.objectContaining({ san: 'O-O', flags: 'k' }),
      );
    });

    it('promotes a pawn with an explicit promotion piece', async () => {
      const { creator, joiner, id } = await setupGame();

      const sequence: [typeof creator.session, string, string][] = [
        [creator.session, 'a2', 'a4'],
        [joiner.session, 'b7', 'b5'],
        [creator.session, 'a4', 'b5'],
        [joiner.session, 'a7', 'a6'],
        [creator.session, 'b5', 'a6'],
        [joiner.session, 'h7', 'h6'],
        [creator.session, 'a6', 'a7'],
        [joiner.session, 'h6', 'h5'],
      ];
      for (const [session, from, to] of sequence) {
        await session.post(`/game/${id}/move`).send({ from, to }).expect(201);
      }

      const res = await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'a7', to: 'b8', promotion: 'q' })
        .expect(201);

      expect(res.body.moves.at(-1)).toEqual(
        expect.objectContaining({
          san: 'axb8=Q',
          promotion: 'q',
          captured: 'n',
        }),
      );
    });

    it('detects checkmate', async () => {
      const { creator, joiner, id } = await setupGame();

      const sequence: [typeof creator.session, string, string][] = [
        [creator.session, 'f2', 'f3'],
        [joiner.session, 'e7', 'e5'],
        [creator.session, 'g2', 'g4'],
      ];
      for (const [session, from, to] of sequence) {
        await session.post(`/game/${id}/move`).send({ from, to }).expect(201);
      }

      const res = await joiner.session
        .post(`/game/${id}/move`)
        .send({ from: 'd8', to: 'h4' })
        .expect(201);

      expect(res.body.status).toBe('checkmate');
      expect(res.body.inCheck).toBe(true);
      expect(res.body.legalMoves).toEqual({});
      expect(res.body.moves.at(-1)?.san).toBe('Qh4#');
    });
  });

  describe('POST /game/:id/move — validation and illegal moves', () => {
    it('400s when the piece cannot move that way', async () => {
      const { creator, id } = await setupGame();

      const res = await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'e2', to: 'e5' })
        .expect(400);

      expect(res.body.message).toContain('Illegal move');
    });

    it('400s when moving an empty square', async () => {
      const { creator, id } = await setupGame();

      await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'e4', to: 'e5' })
        .expect(400);
    });

    it('400s on a malformed square', async () => {
      const { creator, id } = await setupGame();

      const res = await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'z9', to: 'e4' })
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining(['from must be a square like "e2"']),
      );
    });

    it('400s on an unknown field', async () => {
      const { creator, id } = await setupGame();

      await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'e2', to: 'e4', hack: true })
        .expect(400);
    });

    it('400s on an invalid promotion piece', async () => {
      const { creator, id } = await setupGame();

      await creator.session
        .post(`/game/${id}/move`)
        .send({ from: 'e2', to: 'e4', promotion: 'k' })
        .expect(400);
    });
  });

  describe('POST /game/:id/rematch', () => {
    // fool's mate: creator (white) walks into a quick checkmate
    async function finishGame() {
      const { creator, joiner, id } = await setupGame();

      const sequence: [typeof creator.session, string, string][] = [
        [creator.session, 'f2', 'f3'],
        [joiner.session, 'e7', 'e5'],
        [creator.session, 'g2', 'g4'],
        [joiner.session, 'd8', 'h4'],
      ];
      for (const [session, from, to] of sequence) {
        await session.post(`/game/${id}/move`).send({ from, to }).expect(201);
      }

      return { creator, joiner, id };
    }

    it('starts a new game between the same players with swapped colors', async () => {
      const { creator, joiner, id } = await finishGame();

      const res = await creator.session
        .post(`/game/${id}/rematch`)
        .expect(201);
      const next = res.body as GameState;

      expect(next.id).not.toBe(id);
      expect(next.fen).toBe(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      );
      expect(next.status).toBe('in_progress');
      expect(next.moves).toHaveLength(0);
      expect(next.players).toEqual({
        white: joiner.user.id,
        black: creator.user.id,
      });
    });

    it('links the rematch back onto the finished game', async () => {
      const { creator, id } = await finishGame();

      const res = await creator.session
        .post(`/game/${id}/rematch`)
        .expect(201);

      const old = await creator.session.get(`/game/${id}`).expect(200);
      expect(old.body.rematchId).toBe(res.body.id);
    });

    it('is idempotent so both players converge on the same game', async () => {
      const { creator, joiner, id } = await finishGame();

      const first = await creator.session
        .post(`/game/${id}/rematch`)
        .expect(201);
      const second = await joiner.session
        .post(`/game/${id}/rematch`)
        .expect(201);

      expect(second.body.id).toBe(first.body.id);
      await joiner.session.get(`/game/${first.body.id}`).expect(200);
    });

    it('400s while the game is still in progress', async () => {
      const { creator, id } = await setupGame();

      await creator.session.post(`/game/${id}/rematch`).expect(400);
    });

    it('403s for a non-participant', async () => {
      const { id } = await finishGame();
      const stranger = await createSession();

      await stranger.session.post(`/game/${id}/rematch`).expect(403);
    });
  });
});
