declare module 'nkn-sdk' {
    class Wallet {
        constructor (options?: {password?: string});
        static fromJSON (json: string, option: { password: string; async: boolean }): Wallet;
        getPublicKey (): string;
    }
}

