export interface JwtPayload {
  sub: string;
  role: 'facilitator' | 'participant';
  boardId: string;
  iat?: number;
  exp?: number;
}
