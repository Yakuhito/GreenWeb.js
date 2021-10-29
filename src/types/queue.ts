// https://basarat.gitbook.io/algorithms/datastructures/queue

export class Queue<T> {
    _store: T[] = [];

    push(val: T) {
        this._store.push(val);
    }

    pop(): T | undefined {
        return this._store.shift();
    }

    size(): number {
        return this._store.length;
    }
}