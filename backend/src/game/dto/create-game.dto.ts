import { IsIn, IsOptional } from 'class-validator';

export class CreateGameDto {
  /** the color the creator wants to play; defaults to white */
  @IsOptional()
  @IsIn(['w', 'b'])
  color?: 'w' | 'b';
}
