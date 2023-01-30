import {Tags} from "./types/tags";
import {IReporter} from "./types/reporter";
import {ErrorCallback} from "./types/error-callback";

declare interface SpaceOptions {
  key: string;
  tags: Tags;
  reporters: IReporter[];
  errback?: ErrorCallback;
}

export declare class Space {
  constructor(options: SpaceOptions);

  value(val: number) : void;
  increment(val?: number): void;
  meter: <T>(func: () => T) => T;

  space: (nextKey: string, nextTags?: Tags) => Space;
}
