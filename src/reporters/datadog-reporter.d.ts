import {IReporter} from "../types/reporter";
import {Tags} from "../types/tags";

declare interface DataDogReporterOptions {
  host: string;
  port?: number;
  prefix?: string;
  batch?: boolean;
  maxBufferSize?: number;
  flushInterval?: number;
  errback?: ErrorCallback;
}

export declare class DataDogReporter implements IReporter {
  constructor(options: DataDogReporterOptions);
  report(key: string, value: number, tags?: Tags);
  value(key: string, value: number, tags?: Tags);
  increment(key: string, value?: number, tags?: Tags);
  close();
}
