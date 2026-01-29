// import { ms, type StringValue } from "ms";
import ms from "ms";
import { type StringValue } from "ms";

export function converStringToMS(value: string) {
    return ms(value as StringValue)
}

// This function will only accept a string compatible with `ms`.
// example('1 h');