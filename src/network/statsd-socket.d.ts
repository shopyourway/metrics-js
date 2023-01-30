declare interface SendProps {
  key: string;
  value: number;
  type: string;
  tags?: { [key: string]: string | number | boolean }
}

declare interface StatsdSocketOptions {
  port?: number;
  host: string;
  batch?: boolean;
  maxBufferSize?: number;
  flushInterval?: number;
  prefix?: string;
  errback?: (err: Error) => void;
}

export declare class StatsdSocket {
  constructor(options: StatsdSocketOptions);

  send(props: SendProps) : void;
  close() : void;
}
