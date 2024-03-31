import {
    ACCOUNT_ADDRESS_SET,
    ACCOUNT_DETAILS_SET,
    BALANCE_FETCH_ERROR,
    BALANCE_FETCH_IN_PROGRESS,
    BALANCE_FETCH_SUCCESS,
    COSMOS_ACCOUNT_ADDRESS_SET,
    COSMOS_BALANCE_FETCH_ERROR,
    COSMOS_BALANCE_FETCH_IN_PROGRESS,
    COSMOS_BALANCE_FETCH_SUCCESS,
    DELEGATIONS_FETCH_ERROR,
    DELEGATIONS_FETCH_IN_PROGRESS,
    DELEGATIONS_FETCH_SUCCESS,
    DISCONNECT_COSMOS_SET,
    DISCONNECT_SET,
    REWARDS_FETCH_ERROR,
    REWARDS_FETCH_IN_PROGRESS,
    REWARDS_FETCH_SUCCESS,
    SELECT_ACCOUNT_DIALOG_HIDE,
    SELECT_ACCOUNT_DIALOG_SHOW,
    SIGN_IBC_TX_ERROR,
    SIGN_IBC_TX_IN_PROGRESS,
    SIGN_IBC_TX_SUCCESS,
    STAKE_ACCOUNT_ADDRESS_SET,
    TIMEOUT_HEIGHT_FETCH_ERROR,
    TIMEOUT_HEIGHT_FETCH_IN_PROGRESS,
    TIMEOUT_HEIGHT_FETCH_SUCCESS,
    UN_BONDING_DELEGATIONS_FETCH_ERROR,
    UN_BONDING_DELEGATIONS_FETCH_IN_PROGRESS,
    UN_BONDING_DELEGATIONS_FETCH_SUCCESS,
    VESTING_BALANCE_FETCH_ERROR,
    VESTING_BALANCE_FETCH_IN_PROGRESS,
    VESTING_BALANCE_FETCH_SUCCESS,
} from '../../constants/accounts';
import Axios from 'axios';
import {
    urlFetchBalance,
    urlFetchRewards, urlFetchTimeoutHeight,
    urlFetchUnBondingDelegations,
    urlFetchVestingBalance,
} from '../../constants/url';
import { Query } from '../../private_modules/namada/shared';
import { SigningStargateClient } from '@cosmjs/stargate';
// import { Message } from '../../private_modules/namada/types';
// import { init as initShared } from '../../private_modules/namada/shared/init-inline';
import { config } from '../../config';
// import { Tokens } from '@namada/types';

export const setAccountAddress = (value) => {
    return {
        type: ACCOUNT_ADDRESS_SET,
        value,
    };
};

export const setCosmosAccountAddress = (value) => {
    return {
        type: COSMOS_ACCOUNT_ADDRESS_SET,
        value,
    };
};

export const setAccountDetails = (value) => {
    return {
        type: ACCOUNT_DETAILS_SET,
        value,
    };
};

const fetchDelegationsInProgress = () => {
    return {
        type: DELEGATIONS_FETCH_IN_PROGRESS,
    };
};

const fetchDelegationsSuccess = (value) => {
    return {
        type: DELEGATIONS_FETCH_SUCCESS,
        value,
    };
};

const fetchDelegationsError = (message) => {
    return {
        type: DELEGATIONS_FETCH_ERROR,
        message,
    };
};

export const getDelegations = (address) => (dispatch) => {
    dispatch(fetchDelegationsInProgress());
    (async () => {
        // await initShared();

        const query = new Query(config.RPC_URL);
        const array = [address];
        query.query_my_validators(array)
            .then((res) => {
                dispatch(fetchDelegationsSuccess(res));
            })
            .catch((error) => {
                dispatch(fetchDelegationsError(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : 'Failed!',
                ));
            });
    })();
};

const fetchBalanceInProgress = () => {
    return {
        type: BALANCE_FETCH_IN_PROGRESS,
    };
};

const fetchBalanceSuccess = (value) => {
    return {
        type: BALANCE_FETCH_SUCCESS,
        value,
    };
};

const fetchBalanceError = (message) => {
    return {
        type: BALANCE_FETCH_ERROR,
        message,
    };
};

export const getBalance = (address, cb) => (dispatch) => {
    dispatch(fetchBalanceInProgress());
    (async () => {
        // await initShared();

        const query = new Query(config.RPC_URL);
        // console.log('5555', Tokens);
        const array = [config.TOKEN_ADDRESS];
        // if (Tokens && Object.keys(Tokens).length) {
        //     Object.keys(Tokens).map((key) => {
        //         if (key && Tokens[key] && Tokens[key].address) {
        //             array.push(Tokens[key].address);
        //         }
        //
        //         return null;
        //     });
        // }
        query.query_balance(address, array)
            .then((res) => {
                dispatch(fetchBalanceSuccess(res));
                if (cb) {
                    cb(res);
                }
            })
            .catch((error) => {
                dispatch(fetchBalanceError(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                        ? error.response.data.message
                        : 'Failed!',
                ));
                if (cb) {
                    cb(null);
                }
            });
    })();
};

const fetchCosmosBalanceInProgress = () => {
    return {
        type: COSMOS_BALANCE_FETCH_IN_PROGRESS,
    };
};

const fetchCosmosBalanceSuccess = (value) => {
    return {
        type: COSMOS_BALANCE_FETCH_SUCCESS,
        value,
    };
};

const fetchCosmosBalanceError = (message) => {
    return {
        type: COSMOS_BALANCE_FETCH_ERROR,
        message,
    };
};

export const getCosmosBalance = (address, cb) => (dispatch) => {
    dispatch(fetchCosmosBalanceInProgress());
    const url = urlFetchBalance(address);
    Axios.get(url, {
        headers: {
            Accept: 'application/json, text/plain, */*',
            Connection: 'keep-alive',
        },
    })
        .then((res) => {
            dispatch(fetchCosmosBalanceSuccess(res.data && res.data.balances));
            if (cb) {
                cb(res.data && res.data.balances);
            }
        })
        .catch((error) => {
            dispatch(fetchCosmosBalanceError(
                error.response &&
                error.response.data &&
                error.response.data.message
                    ? error.response.data.message
                    : 'Failed!',
            ));
            if (cb) {
                cb(null);
            }
        });
};

const fetchVestingBalanceInProgress = () => {
    return {
        type: VESTING_BALANCE_FETCH_IN_PROGRESS,
    };
};

const fetchVestingBalanceSuccess = (value) => {
    return {
        type: VESTING_BALANCE_FETCH_SUCCESS,
        value,
    };
};

const fetchVestingBalanceError = (message) => {
    return {
        type: VESTING_BALANCE_FETCH_ERROR,
        message,
    };
};

export const fetchVestingBalance = (address) => (dispatch) => {
    dispatch(fetchVestingBalanceInProgress());
    const url = urlFetchVestingBalance(address);
    Axios.get(url, {
        headers: {
            Accept: 'application/json, text/plain, */*',
        },
    })
        .then((res) => {
            dispatch(fetchVestingBalanceSuccess(res.data && res.data.balances));
        })
        .catch((error) => {
            dispatch(fetchVestingBalanceError(
                error.response &&
                error.response.data &&
                error.response.data.message
                    ? error.response.data.message
                    : 'Failed!',
            ));
        });
};

export const showSelectAccountDialog = () => {
    return {
        type: SELECT_ACCOUNT_DIALOG_SHOW,
    };
};

export const hideSelectAccountDialog = () => {
    return {
        type: SELECT_ACCOUNT_DIALOG_HIDE,
    };
};

const fetchUnBondingDelegationsInProgress = () => {
    return {
        type: UN_BONDING_DELEGATIONS_FETCH_IN_PROGRESS,
    };
};

const fetchUnBondingDelegationsSuccess = (value) => {
    return {
        type: UN_BONDING_DELEGATIONS_FETCH_SUCCESS,
        value,
    };
};

const fetchUnBondingDelegationsError = (message) => {
    return {
        type: UN_BONDING_DELEGATIONS_FETCH_ERROR,
        message,
    };
};

export const getUnBondingDelegations = (address) => (dispatch) => {
    dispatch(fetchUnBondingDelegationsInProgress());
    const url = urlFetchUnBondingDelegations(address);
    Axios.get(url, {
        headers: {
            Accept: 'application/json, text/plain, */*',
        },
    })
        .then((res) => {
            dispatch(fetchUnBondingDelegationsSuccess(res.data && res.data.unbonding_responses));
        })
        .catch((error) => {
            dispatch(fetchUnBondingDelegationsError(
                error.response &&
                error.response.data &&
                error.response.data.message
                    ? error.response.data.message
                    : 'Failed!',
            ));
        });
};

export const setStakeAccountAddress = (value) => {
    return {
        type: STAKE_ACCOUNT_ADDRESS_SET,
        value,
    };
};

const fetchRewardsInProgress = () => {
    return {
        type: REWARDS_FETCH_IN_PROGRESS,
    };
};

const fetchRewardsSuccess = (value) => {
    return {
        type: REWARDS_FETCH_SUCCESS,
        value,
    };
};

const fetchRewardsError = (message) => {
    return {
        type: REWARDS_FETCH_ERROR,
        message,
    };
};

export const fetchRewards = (address) => (dispatch) => {
    dispatch(fetchRewardsInProgress());
    const url = urlFetchRewards(address);
    Axios.get(url, {
        headers: {
            Accept: 'application/json, text/plain, */*',
        },
    })
        .then((res) => {
            dispatch(fetchRewardsSuccess(res.data));
        })
        .catch((error) => {
            dispatch(fetchRewardsError(
                error.response &&
                error.response.data &&
                error.response.data.message
                    ? error.response.data.message
                    : 'Failed!',
            ));
        });
};

export const disconnectSet = () => {
    return {
        type: DISCONNECT_SET,
    };
};

export const disconnectCosmosSet = () => {
    return {
        type: DISCONNECT_COSMOS_SET,
    };
};

const signIBCTxInProgress = () => {
    return {
        type: SIGN_IBC_TX_IN_PROGRESS,
    };
};

const signIBCTxSuccess = (value) => {
    return {
        type: SIGN_IBC_TX_SUCCESS,
        value,
        message: 'Transaction Success. Token Transfer in progress...',
        variant: 'success',
    };
};

const signIBCTxError = (message) => {
    return {
        type: SIGN_IBC_TX_ERROR,
        message,
        variant: 'error',
    };
};

export const signIBCTx = (config, tx, cb) => (dispatch) => {
    dispatch(signIBCTxInProgress());

    (async () => {
        await window.keplr && window.keplr.enable(config.CHAIN_ID);
        const offlineSigner = window.getOfflineSignerOnlyAmino && window.getOfflineSignerOnlyAmino(config.CHAIN_ID);
        const client = await SigningStargateClient.connectWithSigner(
            config.RPC_URL,
            offlineSigner,
        );

        client.sendIbcTokens(
            tx.msg && tx.msg.value && tx.msg.value.sender,
            tx.msg && tx.msg.value && tx.msg.value.receiver,
            tx.msg && tx.msg.value && tx.msg.value.token,
            tx.msg && tx.msg.value && tx.msg.value.source_port,
            tx.msg && tx.msg.value && tx.msg.value.source_channel,
            tx.msg && tx.msg.value && tx.msg.value.timeout_height,
            tx.msg && tx.msg.value && tx.msg.value.timeout_timestamp,
            tx.fee,
            tx.memo,
        ).then((result) => {
            if (result && result.code !== undefined && result.code !== 0) {
                dispatch(signIBCTxError(result.log || result.rawLog));
                cb(null);
            } else {
                dispatch(signIBCTxSuccess(result));
                cb(result);
            }
        }).catch((error) => {
            const message = 'success';
            if (error && error.message === 'Invalid string. Length must be a multiple of 4') {
                dispatch(signIBCTxSuccess(message));
                cb(message);
            } else {
                dispatch(signIBCTxError(error && error.message));
                cb(null);
            }
        });
    })();
};

const fetchTimeoutHeightInProgress = () => {
    return {
        type: TIMEOUT_HEIGHT_FETCH_IN_PROGRESS,
    };
};

const fetchTimeoutHeightSuccess = (value) => {
    return {
        type: TIMEOUT_HEIGHT_FETCH_SUCCESS,
        value,
    };
};

const fetchTimeoutHeightError = (message) => {
    return {
        type: TIMEOUT_HEIGHT_FETCH_ERROR,
        message,
        variant: 'error',
    };
};

export const fetchTimeoutHeight = (URL, channel, cb) => (dispatch) => {
    dispatch(fetchTimeoutHeightInProgress());

    const url = urlFetchTimeoutHeight(URL, channel);
    Axios.get(url, {
        headers: {
            Accept: 'application/json, text/plain, */*',
        },
    })
        .then((res) => {
            dispatch(fetchTimeoutHeightSuccess(res.data));
            cb(res.data);
        })
        .catch((error) => {
            dispatch(fetchTimeoutHeightError(
                error.response &&
                error.response.data &&
                error.response.data.message
                    ? error.response.data.message
                    : 'Failed!',
            ));
            cb(null);
        });
};
