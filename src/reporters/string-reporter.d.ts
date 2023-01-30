import {IReporter} from "../types/reporter";
import {Tags} from "../types/tags";

declare interface StringReporterOptions {
  action: (metric: string) => void;
}

export declare class StringReporter implements IReporter {
  constructor(options: StringReporterOptions);
  increment(key: string, value?: number, tags?: Tags);
  report(key: string, value: number, tags?: Tags);
  value(key: string, value: number, tags?: Tags);
}
