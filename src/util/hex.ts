export class Hex {
    public hexlify(value: string): string {
        return value.startsWith("0x") ? value : `0x${value}`;
    }

    public dehexlify(value: string | null): string | null {
        if(value === null) return null;
        return value.startsWith("0x") ? value.slice(2) : value;
    }
}