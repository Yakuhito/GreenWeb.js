export type Optional<T> = T | null;

export type getBalanceArgs = {
    address?: string,
    puzzleHash?: string,
    min_height?: number
};

export interface Provider {
    initialize(): Promise<void>;
    close(): Promise<void>;
    getNetworkId(): string;

    getBlockNumber(): Promise<Optional<number>>;
    getBalance(args: getBalanceArgs): Promise<Optional<number>>;
}