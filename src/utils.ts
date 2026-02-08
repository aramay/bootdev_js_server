// import { ms, type StringValue } from "ms";
import ms from "ms";
import { type StringValue } from "ms";

// This function will only accept a string compatible with `ms`.
// example('1 h');

export function converStringToMS(value: string) {
    return ms(value as StringValue)
}

export function getDate(){
    const date = new Date()
    console.log("date ", date.getDate() + 60)
    return date.getDate() + 60
}
