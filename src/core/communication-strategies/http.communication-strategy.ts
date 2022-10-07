import { ParsedJSON } from '../../common/parsed-json';
import { Response } from '../response';
import { CommunicationStrategy } from './communication-strategy';
import { PayloadForRequestHandler } from './payloads/payload-for-request-handler';
class HTTPCommunicationStrategy implements CommunicationStrategy {
    name: string;
    handleRequest(data: ParsedJSON, payload: PayloadForRequestHandler): Promise<Response> {
        throw new Error('Method not implemented.');
    }
}