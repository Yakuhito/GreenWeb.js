import { buildField } from "../../register";

export const BooleanField = buildField<boolean>({
    serialize: (value, buf) => {
        const buf2 = Buffer.from([0]);
        if(value) {
            buf2.writeUInt8(1);
        }
        return Buffer.concat([buf, buf2]);
    },
    deserialize: (buf) => {
        if(buf.length === 0) throw new Error();

        const val: number = buf.readUInt8();
        if(val > 1) throw new Error();

        return [
            val > 0,
            buf.slice(1),
        ];
    }
});