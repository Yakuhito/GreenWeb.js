// https://github.com/Chia-Network/chia-blockchain/blob/d3e73a75ab44c799f8b6f9a76fab550ad6d7824a/chia/types/condition_opcodes.py#L6

import fields from "../../../util/serializer/types/fields";

export class ConditionOpcode {
    // AGG_SIG is ascii "1"

    // the conditions below require bls12-381 signatures

    @fields.Bytes(1) static AGG_SIG_UNSAFE = "49";
    @fields.Bytes(1) static AGG_SIG_ME = "50";

    // the conditions below reserve coin amounts and have to be accounted for in output totals

    @fields.Bytes(1) static CREATE_COIN = "51";
    @fields.Bytes(1) static RESERVE_FEE = "52";

    // the conditions below deal with announcements, for inter-coin communication

    @fields.Bytes(1) static CREATE_COIN_ANNOUNCEMENT = "60";
    @fields.Bytes(1) static ASSERT_COIN_ANNOUNCEMENT = "61";
    @fields.Bytes(1) static CREATE_PUZZLE_ANNOUNCEMENT = "62";
    @fields.Bytes(1) static ASSERT_PUZZLE_ANNOUNCEMENT = "63";

    // the conditions below let coins inquire about themselves

    @fields.Bytes(1) static ASSERT_MY_COIN_ID = "70";
    @fields.Bytes(1) static ASSERT_MY_PARENT_ID = "71";
    @fields.Bytes(1) static ASSERT_MY_PUZZLEHASH = "72";
    @fields.Bytes(1) static ASSERT_MY_AMOUNT = "73";

    // the conditions below ensure that we're "far enough" in the future

    // wall-clock time
    @fields.Bytes(1) static ASSERT_SECONDS_RELATIVE = "80";
    @fields.Bytes(1) static ASSERT_SECONDS_ABSOLUTE = "81";

    // block index
    @fields.Bytes(1) static ASSERT_HEIGHT_RELATIVE = "82";
    @fields.Bytes(1) static ASSERT_HEIGHT_ABSOLUTE = "83";
}