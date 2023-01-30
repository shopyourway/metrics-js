import {Tags} from "./tags";

export declare interface IReporter {
  report(key: string, value: number, tags?: Tags);

  value(key: string, value: number, tags?: Tags);

  increment(key: string, value?: number, tags?: Tags);
}
