export type Optional<T> = T | null;
export type BlockNumberOrHash = number | Buffer;
export type AddressOrPuzzleHash = string | Buffer;

export interface Provider {
    initialize(): Promise<void>;
    close(): Promise<void>;

    getBlockNumber(): Promise<Optional<number>>;
    getBalance(address: AddressOrPuzzleHash): Promise<Optional<number>>;
}