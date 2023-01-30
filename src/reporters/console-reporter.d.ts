import {Tags} from "../types/tags";

export declare class ConsoleReporter {
  constructor();
  report(key: string, value: number, tags?: Tags);

  value(key: string, value: number, tags?: Tags);

  increment(key: string, value?: number, tags?: Tags);
}
