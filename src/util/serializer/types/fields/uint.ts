import { buildField } from "../../register";
import { FieldSerializer } from "../../interfaces";
import { uint } from "../../basic_types";
import { BigNumber } from "@ethersproject/bignumber";

export const UintField = (size: number, byteorder: "big" | "little" = "big") => {
    const serializer: FieldSerializer<uint> = {
        serialize: (value, buf) => {
            value = BigNumber.from(value);

            let s: string = value.toHexString().slice(2);
            if(s.length < size / 4) {
                const diff: number = size / 4 - s.length;
                s = "0".repeat(diff) + s;
            }
            if(byteorder === "little") {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                s = s.match(/../g)!.reverse().join("");
            }
            const buf2 : Buffer = Buffer.from(s, "hex");
            return Buffer.concat([buf, buf2]);
        },
        deserialize: (buf) => {
            const numOfBytes: number = size / 8;
            if(buf.length <  numOfBytes) throw new Error();
            
            const buf2 = buf.slice(0, numOfBytes);
            buf = buf.slice(numOfBytes);

            let num: BigNumber;
            if(byteorder === "little") {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                num = BigNumber.from("0x" + Buffer.from(buf2.toString("hex").match(/../g)!.reverse().join("")));
            } else {
                num = BigNumber.from("0x" + buf2.toString("hex"));
            }
            return [num, buf];
        },
    };

    return buildField<uint>(serializer)();
};