declare module 'crypto-es' {
    export namespace AES {
        function encrypt(message: string, key: string): { toString(): string };
        function decrypt(encryptedMessage: string, key: string): { toString(enc): string };
    }
    export const enc: {
        Utf8: any;
        Hex: any;
    };
}