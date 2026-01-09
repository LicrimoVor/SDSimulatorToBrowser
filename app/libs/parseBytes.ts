export const parseBytes = (bytes: Uint8Array) => {
    const sec = bytes[0x28].toString(16)
    const min = bytes[0x29].toString(16)
    const hour = bytes[0x2a].toString(16)

    const dd = bytes[0x2c].toString(16)
    const mm = bytes[0x2d].toString(16)
    const yy = bytes[0x2e].toString(16)

    const id = bytes[0x38] + bytes[0x39]
    const km_start = bytes[0x70] + bytes[0x71] * 256

    const left_rigth = bytes[0x78]
    const plus_minus = bytes[0x79]

    return {
        sec,
        min,
        hour,
        dd,
        mm,
        yy,
        id,
        km_start,
        left_rigth,
        plus_minus,
    }
}
