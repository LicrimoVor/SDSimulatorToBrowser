import { AES_IV_HEX, AES_KEY_HEX } from "@/core/const";

function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
}

const AES_KEY = hexToBytes(AES_KEY_HEX);
const AES_IV = hexToBytes(AES_IV_HEX);

const cryptoKey = await crypto.subtle.importKey(
    "raw",
    AES_KEY,
    { name: "AES-CTR" },
    false,
    ["decrypt"]
);


export async function decryptAesCtr(data: ArrayBuffer): Promise<Uint8Array> {
    const decrypted = await crypto.subtle.decrypt(
        {
        name: "AES-CTR",
        counter: AES_IV,
        length: 128,
        },
        cryptoKey,
        data
    );

    return new Uint8Array(decrypted);
}
