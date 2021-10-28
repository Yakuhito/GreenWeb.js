import { buildField } from "../register";

export const BooleanField = buildField<boolean>({
    serialize: (value, buf) => {
        const buf2 = Buffer.from([0]);
        if(value) {
            buf2.writeUInt8(1);
        }
        return Buffer.concat([buf, buf2]);
    }, 
    deserialize: (buf) => {
        return [
            buf.readUInt8() > 0,
            buf.slice(1),
        ];
    }
});