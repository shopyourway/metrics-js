import {IReporter} from "../types/reporter";
import {Tags} from "../types/tags";

declare interface InMemoryReporterOptions {
  buffer: any[];
}

export declare class InMemoryReporter implements IReporter {
  constructor(options: InMemoryReporterOptions);
  increment(key: string, value?: number, tags?: Tags);

  report(key: string, value: number, tags?: Tags);

  value(key: string, value: number, tags?: Tags);
}
