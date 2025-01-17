import { REST_URL, RPC_URL } from './constants/url';
import { SigningStargateClient } from '@cosmjs/stargate';
import { config, cosmosConfig } from './config';
import { cosmos, InstallError } from '@cosmostation/extension-client';
import { getOfflineSigner } from '@cosmostation/cosmos-client';
// import { Sdk } from '@namada/shared';
// import { init as initShared } from '@namada/shared/dist/init-inline';
// // import { AccountType, TransferProps, TxProps } from "@namada/types";
// import {
//     // SubmitBondMsgValue,
//     Message,
//     // TransferMsgSchema,
//     TransferMsgValue,
//     TxMsgValue,
// } from '@namada/types';

const chainId = cosmosConfig.CHAIN_ID;
const chainName = cosmosConfig.CHAIN_NAME;
const coinDenom = cosmosConfig.COIN_DENOM;
const coinMinimalDenom = cosmosConfig.COIN_MINIMAL_DENOM;
const coinDecimals = cosmosConfig.COIN_DECIMALS;
const prefix = cosmosConfig.PREFIX;
const coinGeckoId = cosmosConfig.COINGECKO_ID;

const chainConfig = {
    chainId: chainId,
    chainName,
    rpc: RPC_URL,
    rest: REST_URL,
    stakeCurrency: {
        coinDenom,
        coinMinimalDenom,
        coinDecimals,
        coinGeckoId,
    },
    bip44: {
        coinType: 118,
    },
    bech32Config: {
        bech32PrefixAccAddr: `${prefix}`,
        bech32PrefixAccPub: `${prefix}pub`,
        bech32PrefixValAddr: `${prefix}valoper`,
        bech32PrefixValPub: `${prefix}valoperpub`,
        bech32PrefixConsAddr: `${prefix}valcons`,
        bech32PrefixConsPub: `${prefix}valconspub`,
    },
    currencies: [
        {
            coinDenom,
            coinMinimalDenom,
            coinDecimals,
            coinGeckoId,
        },
    ],
    feeCurrencies: [
        {
            coinDenom,
            coinMinimalDenom,
            coinDecimals,
            coinGeckoId,
            gasPriceStep: {
                low: config.GAS_PRICE_STEP_LOW,
                average: config.GAS_PRICE_STEP_AVERAGE,
                high: config.GAS_PRICE_STEP_HIGH,
            },
        },
    ],
    coinType: config.COIN_TYPE,
    features: config.FEATURES,
    walletUrlForStaking: config.STAKING_URL,
};

export const initializeChain = (cb) => {
    (async () => {
        if (!window.getOfflineSignerOnlyAmino || !window.keplr) {
            const error = 'Download the Keplr Extension';
            cb(error);
        } else {
            if (window.keplr.experimentalSuggestChain) {
                try {
                    await window.keplr.experimentalSuggestChain(chainConfig);
                } catch (error) {
                    const chainError = 'Failed to suggest the chain';
                    cb(chainError);
                }
            } else {
                const versionError = 'Please use the recent version of keplr extension';
                cb(versionError);
            }
        }

        if (window.keplr) {
            await window.keplr.enable(chainId);

            const offlineSigner = window.getOfflineSignerOnlyAmino(chainId);
            const accounts = await offlineSigner.getAccounts();
            cb(null, accounts);
        } else {
            return null;
        }
    })();
};

export const initializeCosmoStation = (cb) => {
    (async () => {
        try {
            const provider = await cosmos();
            const account = await provider.requestAccount(config.COSMOSTAION);
            cb(null, account);
        } catch (error) {
            if (error instanceof InstallError) {
                const error = 'Download the Cosmostation Extension';
                cb(error);
            } else if (error.code === 4001) {
                const error = 'user rejected request';
                cb(error);
            } else {
                cb(error.message);
            }
        }
    })();
};

export const signTxAndBroadcast = (tx, address, cb) => {
    (async () => {
        await window.keplr && window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(chainId);
        const client = await SigningStargateClient.connectWithSigner(
            RPC_URL,
            offlineSigner,
        );
        client.signAndBroadcast(
            address,
            tx.msgs ? tx.msgs : [tx.msg],
            tx.fee,
            tx.memo,
        ).then((result) => {
            if (result && result.code !== undefined && result.code !== 0) {
                cb(result.log || result.rawLog);
            } else {
                cb(null, result);
            }
        }).catch((error) => {
            const message = 'success';
            if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
                cb(null, message);
            } else {
                cb(error && error.message);
            }
        });
    })();
};

export const cosmoStationSign = (tx, address, cb) => {
    (async () => {
        const offlineSigner = await getOfflineSigner(chainId);
        const client = await SigningStargateClient.connectWithSigner(
            RPC_URL,
            offlineSigner,
        );

        client.signAndBroadcast(
            address,
            tx.msgs ? tx.msgs : [tx.msg],
            tx.fee,
            tx.memo,
        ).then((result) => {
            if (result && result.code !== undefined && result.code !== 0) {
                cb(result.log || result.rawLog);
            } else {
                cb(null, result);
            }
        }).catch((error) => {
            const message = 'success';
            if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
                cb(null, message);
            } else {
                cb(error && error.message);
            }
        });
    })();
};

// Namada
export const initializeNamadaChain = (cb) => {
    (async () => {
        const isExtensionInstalled = typeof window.namada === 'object';
        if (!isExtensionInstalled || !window.namada) {
            const error = 'Download the Namada Extension';
            cb(error);
        }

        if (window.namada) {
            const namada = window.namada;
            await namada.connect(chainId);

            const offlineSigner = namada.getSigner(chainId);
            const accounts = await offlineSigner.accounts();
            cb(null, accounts);
        } else {
            return null;
        }
    })();
};

export const sentTransaction = (tx, txs, address, type, cb) => {
    (async () => {
        const isExtensionInstalled = typeof window.namada === 'object';
        if (!isExtensionInstalled || !window.namada) {
            const error = 'Download the Namada Extension';
            cb(error);
        }

        // if (window.namada) {
        //     await initShared();
        //
        //     const transferMsgValue = new TransferMsgValue({
        //         source: tx.source,
        //         target: tx.target,
        //         token: tx.token,
        //         amount: tx.amount,
        //         nativeToken: tx.nativeToken,
        //     });
        //
        //     const txMessageValue = new TxMsgValue({
        //         token: txs.token,
        //         feeAmount: txs.feeAmount,
        //         gasLimit: txs.gasLimit,
        //         chainId: txs.chainId,
        //     });
        //
        //     const sdk = new Sdk(config.RPC_URL);
        //     const message = new Message();
        //     const txEncode = message.encode(transferMsgValue);
        //     // console.log('111', txEncode, tx, txs, address);
        //     const txsEncode = message.encode(txMessageValue);
        //     // console.log('55555', txEncode, message, txsEncode);
        //     sdk.build_transfer(txEncode, txsEncode, address, address)
        //         .then((result) => {
        //             console.log('11111', result);
        //             cb(null, result);
        //         })
        //         .catch((error) => {
        //             console.log('4444', error);
        //             const message = 'success';
        //             if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
        //                 cb(null, message);
        //             } else {
        //                 cb(error && error.message);
        //             }
        //         });
        // } else {
        //     return null;
        // }

        if (window.namada) {
            const namada = window.namada;
            const client = namada && namada.getSigner();

            console.log('000', client, tx, txs, type);
            await client.submitIbcTransfer(tx, txs, type)
                .then(() => {
                    console.log('Transaction was approved by user and submitted via the SDK');
                    // console.log('11111', result);
                    // cb(null, result);
                })
                .catch((error) => {
                    console.error(`Transaction was rejected: ${error}`);
                    // console.log('4444', error);
                    // const message = 'success';
                    // if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
                    //     cb(null, message);
                    // } else {
                    //     cb(error && error.message);
                    // }
                });
        } else {
            return null;
        }
    })();
};

export const delegateTransaction = (tx, txs, type, cb) => {
    (async () => {
        const isExtensionInstalled = typeof window.namada === 'object';
        if (!isExtensionInstalled || !window.namada) {
            const error = 'Download the Namada Extension';
            cb(error);
        }

        // if (window.namada) {
        //     await initShared();
        //
        //     const sdk = new Sdk(config.RPC_URL);
        //     console.log('1', sdk);
        //     const bondMsgValue = new SubmitBondMsgValue({
        //         source: tx.source,
        //         validator: tx.validator,
        //         amount: tx.amount,
        //         nativeToken: tx.nativeToken,
        //     });
        //
        //     // const params = ApprovalsService.getParamsBond(
        //     //     new Uint8Array([]),
        //     //     txs,
        //     // );
        //
        //     // const bond = sdk.encode(bondMsgValue);
        //     // console.log('3333', bondMsgValue, bond);
        //     sdk.build_bond(bondMsgValue, new Uint8Array([]))
        //         .then((result) => {
        //             console.log('11111', result);
        //             cb(null, result);
        //         })
        //         .catch((error) => {
        //             console.log('4444', error);
        //             const message = 'success';
        //             if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
        //                 cb(null, message);
        //             } else {
        //                 cb(error && error.message);
        //             }
        //         });
        // } else {
        //     return null;
        // }

        if (window.namada) {
            const namada = window.namada;
            const client = namada.getSigner();

            client.submitBond(tx, txs, type).then(() => {
                console.log('Transaction was approved by user and submitted via the SDK');
                // console.log('11111', result);
                cb(null, true);
            }).catch((error) => {
                console.error(`Transaction was rejected: ${error}`);
                // console.log('4444', error);
                const message = 'success';
                if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
                    cb(null, message);
                } else {
                    cb(error && error.message);
                }
            });
        } else {
            return null;
        }
    })();
};

export const unDelegateTransaction = (tx, txs, type, cb) => {
    (async () => {
        const isExtensionInstalled = typeof window.namada === 'object';
        if (!isExtensionInstalled || !window.namada) {
            const error = 'Download the Namada Extension';
            cb(error);
        }

        if (window.namada) {
            const namada = window.namada;
            const client = namada.getSigner();

            client.submitUnbond(tx, txs, type).then(() => {
                console.log('Transaction was approved by user and submitted via the SDK');
                cb(null, true);
            }).catch((error) => {
                console.error(`Transaction was rejected: ${error}`);
                const message = 'success';
                if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
                    cb(null, message);
                } else {
                    cb(error && error.message);
                }
            });
        } else {
            return null;
        }
    })();
};
