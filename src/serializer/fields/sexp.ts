import { buildField } from "../register";
import { Stream, Bytes, SExp, sexp_to_stream, sexp_from_stream } from "clvm";

export const SExpField = buildField<SExp>({
    serialize: (value, buf) => {
        const f: Stream = new Stream();
        sexp_to_stream(value, f);
        return Buffer.concat([buf, Buffer.from(f.getValue().raw())]);
    }, 
    deserialize: (buf) => {
        const f: Stream = new Stream(Bytes.from(buf.toString()));
        const obj: SExp = sexp_from_stream(f, SExp.to);
        return [
            obj,
            Buffer.from(f.getValue().raw()),
        ];
    }
});