import {Space} from "./space";
import {Tags} from "./types/tags";
import {IReporter} from "./types/reporter";

declare interface MetricsOptions {
  reporters: IReporter[];
  tags: Tags;
  errback?: ErrorCallback;
}

export declare class Metrics {
  constructor(options: MetricsOptions);

  space(key: string, tags?: Tags): Space;
}
