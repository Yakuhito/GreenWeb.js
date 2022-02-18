import { uint } from "../xch/providers/provider_types";
import { AddressUtil } from "./address";
import { CoinUtil } from "./coin";
import { SerializerUtil } from "./serializer";

export class Util {
    public static address: AddressUtil = new AddressUtil();
    public static coin: CoinUtil = new CoinUtil();
    public static serializer: SerializerUtil = new SerializerUtil();
    public static mojoPerXCH: uint = 1000000000000;

    public static formatToken(amount: uint, amountPerUnit: uint = 1000): string {
        if(isNaN(amount)) {
            return "0.0";
        }

        const wholeUnits: uint = Math.floor(amount / amountPerUnit);

        let decimalThing: string = Number(amount % amountPerUnit).toString();
        const targetLen = amountPerUnit.toString().length - 1;
        if(decimalThing.length < targetLen) {
            decimalThing = "0".repeat(targetLen - decimalThing.length) + decimalThing;
        }

        while(decimalThing.length > 1 && decimalThing[decimalThing.length - 1] === "0") {
            decimalThing = decimalThing.slice(0, -1);
        }

        return `${wholeUnits}.${decimalThing}`;
    }

    public static parseToken(s: string, amountPerUnit: uint = 1000): uint {
        let dots = 0;
        let valid = true;
        for(let i = 0; i < s.length && valid; ++i) {
            if(s.charAt(i) === ".") {
                dots += 1;
            } else if(!/^\d$/.test(s.charAt(i))) {
                valid = false;
            }
        }
        let wholeUnits = 0;
        let amountAfterDot = 0;

        if(dots === 0) {
            wholeUnits = +s;
        } else if(dots === 1) {
            const arr = s.split(".");
            wholeUnits = +arr[0];
            
            let amountAfterDotS = arr[1];
            const missingZeros = amountPerUnit.toString().length - amountAfterDotS.length - 1;
            if(missingZeros > 0) {
                amountAfterDotS = amountAfterDotS + "0".repeat(missingZeros);
            }
            amountAfterDot = +amountAfterDotS;

            if(amountAfterDot > amountPerUnit) {
                valid = false;
            }
        } else {
            valid = false;
        }

        if(valid) {
            return wholeUnits * amountPerUnit + amountAfterDot;
        }
        return 0;
    }

    public static formatChia(mojos: uint): string {
        return Util.formatToken(mojos, Util.mojoPerXCH);
    }

    public static parseChia(s: string): uint {
        return Util.parseToken(s, Util.mojoPerXCH);
    }
}