import { AccountType, DerivedAccount } from "./account";
import { Chain } from "./chain";
import { SignatureResponse, Signer } from "./signer";
export type TxMsgProps = {
    txType: any;
    specificMsg: string;
    txMsg: string;
    type: AccountType;
};
export type SignArbitraryProps = {
    signer: string;
    data: string;
};
export type VerifyArbitraryProps = {
    publicKey: string;
    hash: string;
    signature: string;
};
export type BalancesProps = {
    owner: string;
    tokens: string[];
};
export interface Namada {
    accounts(chainId?: string): Promise<DerivedAccount[] | undefined>;
    balances(props: BalancesProps): Promise<{
        token: string;
        amount: string;
    }[] | undefined>;
    shieldedSync(): Promise<void>;
    connect(chainId?: string): Promise<void>;
    isConnected(): Promise<boolean | undefined>;
    defaultAccount(chainId?: string): Promise<DerivedAccount | undefined>;
    sign(props: SignArbitraryProps): Promise<SignatureResponse | undefined>;
    verify(props: VerifyArbitraryProps): Promise<void>;
    submitTx: (props: TxMsgProps) => Promise<void>;
    getChain: () => Promise<Chain | undefined>;
    version: () => string;
}
export type WindowWithNamada = Window & typeof globalThis & {
    namada: Namada & {
        getSigner: () => Signer;
    };
};
