export const parseBytes = (bytes: Uint8Array<ArrayBuffer>) => {
    const dd = bytes[0x2C].toString(16)
    const mm = bytes[0x2D].toString(16)
    const yy = bytes[0x2E].toString(16)

    const id = bytes[0x38] + bytes[0x39]
    const km_start = bytes[0x70] + bytes[0x71] * 256

    const left_rigth = bytes[0x78]
    const plus_minus = bytes[0x79]

    console.log(dd, mm, yy, id, km_start, left_rigth, plus_minus)
}