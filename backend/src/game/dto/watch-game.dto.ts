import { IsUUID } from 'class-validator';

export class WatchGameDto {
  @IsUUID()
  gameId!: string;
}
