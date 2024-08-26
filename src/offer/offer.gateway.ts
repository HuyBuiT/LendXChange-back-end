import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'offers', transports: 'websocket' })
export class OfferGateway {}
