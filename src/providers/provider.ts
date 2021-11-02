export type Optional<T> = T | null;
export type BlockNumberOrHash = number | Buffer;

export interface Provider {
    initialize(): Promise<void>;

    getBlockNumber(): Promise<Optional<number>>;
    //getBlock(): Promise<Optional<Block>>
}