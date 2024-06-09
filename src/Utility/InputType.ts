import {Keys, PointerButton} from "excalibur";

enum ScrollDirection {
    ScrollUp = 'ScrollUp',
    ScrollDown = 'ScrollDown',
}

export type InputType = Keys | PointerButton | ScrollDirection;
export const InputType = {
    ...Keys,
    ...PointerButton,
    ...ScrollDirection,
} as const;
