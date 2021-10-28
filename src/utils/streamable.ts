// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/util/streamable.py#L260

// function parse_bool(buf: Buffer) : [boolean, Buffer] {

// }

// function parse_uint32(buf: Buffer, byteorder: "big"|"little" = "big"): [uint32, Buffer] {
//     return [
//         byteorder == "big" ? buf.readUInt32BE() : buf.readUInt32LE(),
//         buf.slice(4),
//     ];
// }

// function write_uint32(buf: Buffer, value: uint32, byteorder: "big"|"little" = "big"): Buffer {
//     var buf2 : Buffer = Buffer.alloc(4);
//     if(byteorder == "big") {
//         buf2.writeUInt32BE(value);
//     } else {
//         buf2.writeUInt32LE(value);
//     }
//     return Buffer.concat([buf, buf2]);
// }

// function parse_optional<T>(buf: Buffer, parse_inner_type_f: (...args: any[]) => [T, Buffer]): [Optional<T>, Buffer] {
//     const present_res: [boolean, Buffer] = parse_bool(buf);
//     const is_present_bytes: boolean = present_res[0];
//     buf = pressent_res[1];

//     if(is_present_bytes) {
//         return parse_inner_type_f(buf);
//     } else {
//         return [
//             null,
//             buf
//         ];
//     }
// }

// function parse_bytes(buf: Buffer): [Buffer, Buffer] {
//     const size_res: [uint32, Buffer] = parse_uint32(buf);
//     const list_size: uint32 = size_res[0];
//     buf = size_res[1];

//     return [
//         buf.slice(0, list_size),
//         buf.slice(list_size),
//     ];
// }

// function parse_list<T>(buf: Buffer, parse_inner_type_f: (...args: any[]) => [T, Buffer]): [Array<T>, Buffer] {
//     var list: Array<T> = [];

//     const size_res: [uint32, Buffer] = parse_uint32(buf);
//     const list_size: uint32 = size_res[0];
//     buf = size_res[1];

//     for(var i = 0; i < list_size; ++i) {
//         var parse_res: [T, Buffer] = parse_inner_type_f(buf);
//         var parsed_obj: T = parse_res[0];
//         buf = parse_res[1];

//         list.push(parsed_obj);
//     }

//     return [list, buf];
// }

// function parse_touple(buf: Buffer, list_parse_inner_type_f: Array<(...args: any[]) => [any, Buffer]>): [[...types: any], Buffer] {
//     var list: Array<any> = [];

//     for(var i = 0; i < list_parse_inner_type_f.length; ++i) {
//         var parse_res: [any, Buffer] = list_parse_inner_type_f[i](buf);
//         var parsed_obj: any = parse_res[0];
//         buf = parse_res[1];

//         list.push(parsed_obj);
//     }

//     const t: [...types: any] = list;
//     return [t, buf];
// }

// function parse_string(buf: Buffer): [string, Buffer] {
//     const size_res: [uint32, Buffer] = parse_uint32(buf);
//     const str_size: uint32 = size_res[0];
//     buf = size_res[1];

//     return [
//         buf.slice(0, str_size).toString(),
//         buf.slice(str_size),
//     ];
// }

/*function parse_basic_type<T>(buf: Buffer): [any, Buffer] {
    if(typeof true === "boolean") {

    }
    return [T(), buf];
}*/

// TODO