declare interface SocketOptions {
  port: number;
  host: string;
  maxBufferSize?: number;
  flushInterval?: number;
  errback?: (err: Error) => void;
}

declare interface SendProps {
  message: any;
}

declare class Socket {
  constructor(options: SocketOptions);

  send(props: SendProps) : void;
  close() : void;
}
