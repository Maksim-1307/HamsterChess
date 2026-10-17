import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

const SQUARE_PATTERN = /^[a-h][1-8]$/;

export class CreateMoveDto {
  @IsString()
  @Matches(SQUARE_PATTERN, { message: 'from must be a square like "e2"' })
  from!: string;

  @IsString()
  @Matches(SQUARE_PATTERN, { message: 'to must be a square like "e4"' })
  to!: string;

  @IsOptional()
  @IsIn(['q', 'r', 'b', 'n'])
  promotion?: 'q' | 'r' | 'b' | 'n';
}
