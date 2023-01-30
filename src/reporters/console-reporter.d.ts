import {Tags} from "../types/tags";
import {IReporter} from "../types/reporter";

export declare class ConsoleReporter implements IReporter {
  constructor();

  report(key: string, value: number, tags?: Tags);
  value(key: string, value: number, tags?: Tags);
  increment(key: string, value?: number, tags?: Tags);
}
