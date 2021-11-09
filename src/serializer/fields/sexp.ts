import { buildField } from "../register";
// eslint-disable-next-line camelcase
import { Stream, Bytes, SExp, sexp_to_stream, sexp_from_stream } from "clvm";

export const SExpField = buildField<SExp>({
    serialize: (value, buf) => {
        const f: Stream = new Stream();
        sexp_to_stream(value, f);
        
        return Buffer.concat([buf, Buffer.from(f.getValue().raw())]);
    },
    deserialize: (buf) => {
        const f: Stream = new Stream(new Bytes(buf));
        const obj: SExp = sexp_from_stream(f, SExp.to);
        // hax
        const f2: Stream = new Stream();
        sexp_to_stream(obj, f2);
        const serializedLength: number = f2.getValue().hex().length / 2;
        return [
            obj,
            buf.slice(serializedLength),
        ];
    }
});