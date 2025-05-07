export interface JwtPayload {
  sub: string; // user ID
  boardId: string;
  role: 'facilitator' | 'participant';
  iat?: number;
  exp?: number;
}
