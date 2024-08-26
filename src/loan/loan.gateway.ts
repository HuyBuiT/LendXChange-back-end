import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'loans', transports: 'websocket' })
export class LoanGateway {}
