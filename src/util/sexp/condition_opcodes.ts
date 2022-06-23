// https://github.com/Chia-Network/chia-blockchain/blob/d3e73a75ab44c799f8b6f9a76fab550ad6d7824a/chia/types/condition_opcodes.py#L6

export enum ConditionOpcode {
    // AGG_SIG is ascii "1"

    // the conditions below require bls12-381 signatures

    AGG_SIG_UNSAFE = "31",
    AGG_SIG_ME = "32",

    // the conditions below reserve coin amounts and have to be accounted for in output totals

    CREATE_COIN = "33",
    RESERVE_FEE = "34",

    // the conditions below deal with announcements, for inter-coin communication

    CREATE_COIN_ANNOUNCEMENT = "3c",
    ASSERT_COIN_ANNOUNCEMENT = "3d",
    CREATE_PUZZLE_ANNOUNCEMENT = "3e",
    ASSERT_PUZZLE_ANNOUNCEMENT = "3f",

    // the conditions below let coins inquire about themselves

    ASSERT_MY_COIN_ID = "46",
    ASSERT_MY_PARENT_ID = "47",
    ASSERT_MY_PUZZLEHASH = "48",
    ASSERT_MY_AMOUNT = "49",

    // the conditions below ensure that we're "far enough" in the future

    // wall-clock time
    ASSERT_SECONDS_RELATIVE = "50",
    ASSERT_SECONDS_ABSOLUTE = "51",

    // block index
    ASSERT_HEIGHT_RELATIVE = "52",
    ASSERT_HEIGHT_ABSOLUTE = "53",
}