// https://github.com/Chia-Mine/clvm-js/blob/main/src/costs.ts

export const IF_COST = 33;
export const CONS_COST = 50;
export const FIRST_COST = 30;
export const REST_COST = 30;
export const LISTP_COST = 19;

export const MALLOC_COST_PER_BYTE = 10;

export const ARITH_BASE_COST = 99;
export const ARITH_COST_PER_BYTE = 3;
export const ARITH_COST_PER_ARG = 320;

export const LOG_BASE_COST = 100;
export const LOG_COST_PER_BYTE = 3;
export const LOG_COST_PER_ARG = 264;

export const GRS_BASE_COST = 117;
export const GRS_COST_PER_BYTE = 1;

export const EQ_BASE_COST = 117;
export const EQ_COST_PER_BYTE = 1;

export const GR_BASE_COST = 498;
export const GR_COST_PER_BYTE = 2;

export const DIVMOD_BASE_COST = 1116;
export const DIVMOD_COST_PER_BYTE = 6;

export const DIV_BASE_COST = 988;
export const DIV_COST_PER_BYTE = 4;

export const SHA256_BASE_COST = 87;
export const SHA256_COST_PER_ARG = 134;
export const SHA256_COST_PER_BYTE = 2;

export const POINT_ADD_BASE_COST = 101094;
export const POINT_ADD_COST_PER_ARG = 1343980;

export const PUBKEY_BASE_COST = 1325730;
export const PUBKEY_COST_PER_BYTE = 38;

export const MUL_BASE_COST = 92;
export const MUL_COST_PER_OP = 885;
export const MUL_LINEAR_COST_PER_BYTE = 6;
export const MUL_SQUARE_COST_PER_BYTE_DIVIDER = 128;

export const STRLEN_BASE_COST = 173;
export const STRLEN_COST_PER_BYTE = 1;

export const PATH_LOOKUP_BASE_COST = 40;
export const PATH_LOOKUP_COST_PER_LEG = 4;
export const PATH_LOOKUP_COST_PER_ZERO_BYTE = 4;

export const CONCAT_BASE_COST = 142;
export const CONCAT_COST_PER_ARG = 135;
export const CONCAT_COST_PER_BYTE = 3;

export const BOOL_BASE_COST = 200;
export const BOOL_COST_PER_ARG = 300;

export const ASHIFT_BASE_COST = 596;
export const ASHIFT_COST_PER_BYTE = 3;

export const LSHIFT_BASE_COST = 277;
export const LSHIFT_COST_PER_BYTE = 3;

export const LOGNOT_BASE_COST = 331;
export const LOGNOT_COST_PER_BYTE = 3;

export const APPLY_COST = 90;
export const QUOTE_COST = 20;
