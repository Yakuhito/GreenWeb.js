import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { AddressUtil } from "./address";
import { CoinUtil } from "./coin";
import { GobyUtil } from "./goby";
import { KeyUtil } from "./key";
import { NetworkUtil } from "./network";
import { SerializerUtil } from "./serializer";
import { SExpUtil } from "./sexp";
import { SpendUtil } from "./spend";

export class Util {
    public static address: AddressUtil = new AddressUtil();
    public static coin: CoinUtil = new CoinUtil();
    public static serializer: SerializerUtil = new SerializerUtil();
    public static network: NetworkUtil = new NetworkUtil();
    public static sexp: SExpUtil = new SExpUtil();
    public static goby: GobyUtil = new GobyUtil();
    public static key: KeyUtil = new KeyUtil();
    public static spend: SpendUtil = new SpendUtil();
    public static mojoPerXCH: BigNumber = BigNumber.from(1000000000000);

    public static formatToken(amount: BigNumberish, amountPerUnit: BigNumberish = 1000): string {
        try {
            amount = BigNumber.from(amount);
        } catch(_) {
            amount = BigNumber.from(0); // amount was NaN
        }
        
        try {
            amountPerUnit = BigNumber.from(amountPerUnit);
        } catch (_) {
            amountPerUnit = BigNumber.from(1); // amountPerUnit was NaN
        }
        if(amountPerUnit.eq(0)) {
            amountPerUnit = BigNumber.from(1);
        }

        const wholeUnits: BigNumber = amount.div(amountPerUnit);

        let decimalThing: string = amount.mod(amountPerUnit).toString();
        const targetLen = amountPerUnit.toString().length - 1;
        if(decimalThing.length < targetLen) {
            decimalThing = "0".repeat(targetLen - decimalThing.length) + decimalThing;
        }

        while(decimalThing.length > 1 && decimalThing[decimalThing.length - 1] === "0") {
            decimalThing = decimalThing.slice(0, -1);
        }

        return `${wholeUnits.toString()}.${decimalThing}`;
    }

    public static parseToken(s: string, amountPerUnit: BigNumberish = 1000): BigNumber {
        amountPerUnit = BigNumber.from(amountPerUnit);

        let dots = 0;
        let valid = true;
        for(let i = 0; i < s.length && valid; ++i) {
            if(s.charAt(i) === ".") {
                dots += 1;
            } else if(!/^\d$/.test(s.charAt(i))) {
                valid = false;
            }
        }
        let wholeUnits: BigNumber = BigNumber.from(0);
        let amountAfterDot: BigNumber = BigNumber.from(0);

        if(dots === 0 && valid) {
            wholeUnits = BigNumber.from(s);
        } else if(dots === 1 && valid) {
            const arr = s.split(".");
            wholeUnits = BigNumber.from(arr[0]);
            
            let amountAfterDotS: string = arr[1];
            const missingZeros = amountPerUnit.toString().length - amountAfterDotS.length - 1;
            if(missingZeros > 0) {
                amountAfterDotS = amountAfterDotS + "0".repeat(missingZeros);
            }
            amountAfterDot = BigNumber.from(amountAfterDotS);

            if(amountAfterDot.gt(amountPerUnit)) {
                valid = false;
            }
        } else {
            valid = false;
        }

        if(valid) {
            return wholeUnits.mul(amountPerUnit).add(amountAfterDot);
        } else {
            throw new Error("The given string is not valid.");
        }
    }

    public static formatChia(mojos: BigNumberish): string {
        return Util.formatToken(mojos, Util.mojoPerXCH);
    }

    public static parseChia(s: string): BigNumberish {
        return Util.parseToken(s, Util.mojoPerXCH);
    }
}