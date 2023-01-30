import {ErrorCallback} from "../types/error-callback";

declare interface SocketOptions {
  port: number;
  host: string;
  maxBufferSize?: number;
  flushInterval?: number;
  errback?: ErrorCallback;
}

declare interface SendProps {
  message: any;
}

export declare class Socket {
  constructor(options: SocketOptions);

  send(props: SendProps) : void;
  close() : void;
}
