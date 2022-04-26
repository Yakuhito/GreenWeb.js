// https://github.com/Chia-Network/chia-blockchain/blob/d3e73a75ab44c799f8b6f9a76fab550ad6d7824a/chia/types/condition_with_args.py#L10

import { bytes } from "../../xch/providers/provider_types";
import fields from "../serializer/types/fields";
import { ConditionOpcode } from "./condition_opcodes";

export class ConditionWithArgs {
    @fields.Bytes() opcode: ConditionOpcode;
    @fields.List(fields.Bytes) vars: bytes[];
}