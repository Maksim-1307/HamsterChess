import { Injectable } from '@nestjs/common';
import { GameRecord, GameRepository } from './game-repository.interface';

@Injectable()
export class InMemoryGameRepository implements GameRepository {
  private readonly store = new Map<string, GameRecord>();

  async save(record: GameRecord): Promise<GameRecord> {
    this.store.set(record.id, { ...record, moves: [...record.moves] });
    return record;
  }

  async findById(id: string): Promise<GameRecord | null> {
    const record = this.store.get(id);
    return record ? { ...record, moves: [...record.moves] } : null;
  }
}
