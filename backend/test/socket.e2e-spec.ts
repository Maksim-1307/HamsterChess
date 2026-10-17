import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Game socket (e2e)', () => {
  let app: INestApplication<App>;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    await app.listen(0);

    baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  async function register() {
    const res = await http()
      .post('/auth/register')
      .send({
        username: `sock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        password: 'password123',
      })
      .expect(201);

    const cookies = res.headers['set-cookie'] as unknown as string[];
    const access = cookies.find((cookie) => cookie.startsWith('access_token='));
    if (!access) throw new Error('registration did not set an access cookie');

    return { id: res.body.id as string, cookie: access.split(';')[0] };
  }

  function connect(cookie?: string): Socket {
    return io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      forceNew: true,
      extraHeaders: cookie ? { Cookie: cookie } : {},
    });
  }

  function watch(
    socket: Socket,
    gameId: string,
  ): Promise<{ watching: boolean }> {
    return new Promise((resolve) =>
      socket.emit('game:watch', { gameId }, resolve),
    );
  }

  function waitFor(socket: Socket, event: string): Promise<unknown[]> {
    return new Promise((resolve) =>
      socket.once(event, (...args: unknown[]) => resolve(args)),
    );
  }

  async function createGameWithPlayers() {
    const white = await register();
    const black = await register();

    const created = await http()
      .post('/game')
      .set('Cookie', white.cookie)
      .send({ color: 'w' })
      .expect(201);
    const gameId = created.body.id as string;

    await http()
      .post(`/game/${gameId}/join`)
      .set('Cookie', black.cookie)
      .expect(201);

    return { white, black, gameId };
  }

  it('wakes the opponent but not the player who moved', async () => {
    const { white, black, gameId } = await createGameWithPlayers();

    const whiteSocket = connect(white.cookie);
    const blackSocket = connect(black.cookie);
    await waitFor(whiteSocket, 'connect');
    await waitFor(blackSocket, 'connect');

    expect(await watch(whiteSocket, gameId)).toEqual({ watching: true });
    expect(await watch(blackSocket, gameId)).toEqual({ watching: true });

    let whiteNotified = false;
    whiteSocket.on('game:updated', () => {
      whiteNotified = true;
    });

    const opponentUpdate = waitFor(blackSocket, 'game:updated');
    await http()
      .post(`/game/${gameId}/move`)
      .set('Cookie', white.cookie)
      .send({ from: 'e2', to: 'e4' })
      .expect(201);

    const payload = await opponentUpdate;
    expect(payload).toEqual([]);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(whiteNotified).toBe(false);

    whiteSocket.disconnect();
    blackSocket.disconnect();
  });

  it('rejects a socket without a valid session', async () => {
    const anon = connect();

    const [event] = await Promise.race([
      waitFor(anon, 'disconnect'),
      waitFor(anon, 'connect_error'),
    ]);

    expect(event).toBeDefined();
    anon.disconnect();
  });

  it('does not let a stranger watch a game', async () => {
    const { gameId } = await createGameWithPlayers();
    const stranger = await register();

    const socket = connect(stranger.cookie);
    await waitFor(socket, 'connect');

    expect(await watch(socket, gameId)).toEqual({ watching: false });

    socket.disconnect();
  });

  it('wakes both players when a rematch is created', async () => {
    const { white, black, gameId } = await createGameWithPlayers();

    // fool's mate ends the game
    const moves: [string, string, string][] = [
      [white.cookie, 'f2', 'f3'],
      [black.cookie, 'e7', 'e5'],
      [white.cookie, 'g2', 'g4'],
      [black.cookie, 'd8', 'h4'],
    ];
    for (const [cookie, from, to] of moves) {
      await http()
        .post(`/game/${gameId}/move`)
        .set('Cookie', cookie)
        .send({ from, to })
        .expect(201);
    }

    const whiteSocket = connect(white.cookie);
    const blackSocket = connect(black.cookie);
    await waitFor(whiteSocket, 'connect');
    await waitFor(blackSocket, 'connect');
    await watch(whiteSocket, gameId);
    await watch(blackSocket, gameId);

    const whiteUpdate = waitFor(whiteSocket, 'game:updated');
    const blackUpdate = waitFor(blackSocket, 'game:updated');

    await http()
      .post(`/game/${gameId}/rematch`)
      .set('Cookie', white.cookie)
      .expect(201);

    expect(await whiteUpdate).toEqual([]);
    expect(await blackUpdate).toEqual([]);

    const old = await http()
      .get(`/game/${gameId}`)
      .set('Cookie', black.cookie)
      .expect(200);
    expect(old.body.rematchId).toEqual(expect.any(String));

    whiteSocket.disconnect();
    blackSocket.disconnect();
  });
});
