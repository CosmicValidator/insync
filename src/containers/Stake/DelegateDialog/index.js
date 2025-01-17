import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import './index.css';
import variables from '../../../utils/variables';
import {
    getDelegatedValidatorsDetails,
    hideDelegateDialog,
    showDelegateFailedDialog,
    showDelegateProcessingDialog,
    showDelegateSuccessDialog,
    selectMultiValidators,
} from '../../../actions/stake';
import ValidatorSelectField from './ValidatorSelectField';
import TokensTextField from './TokensTextField';
import ToValidatorSelectField from './ToValidatorSelectField';
import MultiValidatorSelectField from './MultiValidatorSelectField';
import { cosmoStationSign, delegateTransaction, signTxAndBroadcast, unDelegateTransaction } from '../../../helper';
import {
    fetchRewards,
    fetchVestingBalance,
    getBalance,
    getDelegations,
    getUnBondingDelegations,
} from '../../../actions/accounts';
import { showMessage } from '../../../actions/snackbar';
import { config } from '../../../config';
import CircularProgress from '../../../components/CircularProgress';
import { connect } from 'react-redux';
import { gas } from '../../../defaultGasValues';
import BigNumber from 'bignumber.js';

const DelegateDialog = (props) => {
    const [inProgress, setInProgress] = useState(false);
    const handleDelegateType = () => {
        setInProgress(true);
        // let gasValue = gas.delegate;
        // if (props.name === 'Redelegate') {
        //     gasValue = gas.re_delegate;
        // } else if (props.name === 'Undelegate') {
        //     gasValue = gas.un_delegate;
        // }

        // const updatedTx = {
        //     msg: {
        //         typeUrl: props.name === 'Delegate' || props.name === 'Stake'
        //             ? '/cosmos.staking.v1beta1.MsgDelegate' : props.name === 'Undelegate'
        //                 ? '/cosmos.staking.v1beta1.MsgUndelegate' : props.name === 'Redelegate'
        //                     ? '/cosmos.staking.v1beta1.MsgBeginRedelegate' : '',
        //         value: getValueObject(props.name),
        //     },
        //     fee: {
        //         amount: [{
        //             amount: String(gasValue * config.GAS_PRICE_STEP_AVERAGE),
        //             denom: config.COIN_MINIMAL_DENOM,
        //         }],
        //         gas: String(gasValue),
        //     },
        //     memo: '',
        // };

        let value = null;
        if (props.genesisValidatorList && props.genesisValidatorList[props.validator]) {
            value = props.genesisValidatorList[props.validator];
        }

        const tx = {
            source: props.address,
            validator: value && value.nam_address,
            amount: new BigNumber(props.amount),
        };

        if (props.name === 'Delegate' || props.name === 'Stake') {
            tx.nativeToken = 'NAAN';
        }

        const txs = {
            token: config.TOKEN_ADDRESS,
            feeAmount: new BigNumber(0.000100),
            gasLimit: new BigNumber(10000),
            chainId: config.CHAIN_ID,
            publicKey: props.details && props.details.publicKey,
        };

        // if (localStorage.getItem('of_co_wallet') === 'cosmostation') {
        //     cosmoStationSign(updatedTx, props.address, handleFetch);
        //     return;
        // }

        if (props.name === 'Undelegate') {
            unDelegateTransaction(tx, txs, props.details && props.details.type, handleFetch);
        } else {
            delegateTransaction(tx, txs, props.details && props.details.type, handleFetch);
        }
    };

    const handleMultiDelegate = () => {
        setInProgress(true);
        let gasValue = gas.delegate;
        if (props.selectedMultiValidatorArray && props.selectedMultiValidatorArray.length > 1) {
            gasValue = ((gas.delegate * props.selectedMultiValidatorArray.length) / 1.1) + gas.delegate;
        }

        const updatedTx = {
            msgs: [],
            fee: {
                amount: [{
                    amount: String(gasValue * config.GAS_PRICE_STEP_AVERAGE),
                    denom: config.COIN_MINIMAL_DENOM,
                }],
                gas: String(gasValue),
            },
            memo: '',
        };

        if (props.selectedMultiValidatorArray.length) {
            props.selectedMultiValidatorArray.map((item) => {
                updatedTx.msgs.push({
                    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
                    value: {
                        delegatorAddress: props.address,
                        validatorAddress: item,
                        amount: {
                            amount: String(Math.floor((props.amount * (10 ** config.COIN_DECIMALS)) / (props.selectedMultiValidatorArray.length))),
                            denom: config.COIN_MINIMAL_DENOM,
                        },
                    },
                });
                return null;
            });
        }

        if (localStorage.getItem('of_co_wallet') === 'cosmostation') {
            cosmoStationSign(updatedTx, props.address, handleFetch);
            return;
        }

        signTxAndBroadcast(updatedTx, props.address, handleFetch);
    };

    const handleFetch = () => {
        let balance = null;
        props.balance && props.balance.length && props.balance.map((val) => {
            if (val && val.length) {
                val.map((value) => {
                    if (value === config.TOKEN_ADDRESS) {
                        balance = val[1];
                    }
                });
            }

            return null;
        });

        const available = balance;
        const intervalTime = setInterval(() => {
            props.getBalance(props.address, (result) => {
                if (result && result.length) {
                    let localBalance = null;
                    result && result.length && result.map((val) => {
                        if (val && val.length) {
                            val.map((value) => {
                                if (value === config.TOKEN_ADDRESS) {
                                    localBalance = val[1];
                                }
                            });
                        }

                        return null;
                    });

                    if (localBalance !== available) {
                        setInProgress(false);
                        clearInterval(intervalTime);
                        props.successDialog(null);
                        updateBalance();
                    }
                }
            });
        }, 2000);

        if (intervalTime) {
            setTimeout(() => {
                setInProgress(false);
                clearInterval(intervalTime);
            }, 60000);
        }

        // if (error) {
        //     if (error.indexOf('not yet found on the chain') > -1) {
        //         props.pendingDialog();
        //         return;
        //     }
        //     props.failedDialog();
        //     props.showMessage(error);
        //     return;
        // }
        // if (result) {
        //     props.successDialog(result.transactionHash);
        //     updateBalance();
        // }
    };

    const updateBalance = () => {
        setTimeout(() => {
            props.getBalance(props.address);
        }, 4000);
        // props.fetchVestingBalance(props.address);
        props.getDelegations(props.address);
        // props.getUnBondingDelegations(props.address);
        // props.getDelegatedValidatorsDetails(props.address);
        // props.fetchRewards(props.address);
    };

    // const getValueObject = (type) => {
    //     switch (type) {
    //     case 'Stake':
    //     case 'Delegate':
    //     case 'Undelegate':
    //         return {
    //             delegatorAddress: props.address,
    //             validatorAddress: props.validator,
    //             amount: {
    //                 amount: String(props.amount * (10 ** config.COIN_DECIMALS)),
    //                 denom: config.COIN_MINIMAL_DENOM,
    //             },
    //         };
    //     case 'Redelegate':
    //         return {
    //             delegatorAddress: props.address,
    //             validatorSrcAddress: props.validator,
    //             validatorDstAddress: props.toValidator,
    //             amount: {
    //                 amount: String(props.amount * (10 ** config.COIN_DECIMALS)),
    //                 denom: config.COIN_MINIMAL_DENOM,
    //             },
    //         };
    //     default:
    //         return {};
    //     }
    // };

    let staked = props.delegations && props.delegations.reduce((accumulator, currentValue) => {
        if (currentValue && currentValue.length && currentValue[2]) {
            return accumulator + Number(currentValue[2]);
        }
    }, 0);
    let balance = null;
    props.balance && props.balance.length && props.balance.map((val) => {
        if (val && val.length) {
            val.map((value) => {
                if (value === config.TOKEN_ADDRESS) {
                    balance = val[1];
                }
            });
        }

        return null;
    });

    const available = balance;

    const vesting = props.vestingBalance && props.vestingBalance.value && props.vestingBalance.value['base_vesting_account'] &&
        props.vestingBalance.value['base_vesting_account']['original_vesting'] &&
        props.vestingBalance.value['base_vesting_account']['original_vesting'].reduce((accumulator, currentValue) => {
            return accumulator + Number(currentValue.amount);
        }, 0);
    const delegatedVesting = props.vestingBalance && props.vestingBalance.value && props.vestingBalance.value['base_vesting_account'] &&
        props.vestingBalance.value['base_vesting_account']['delegated_vesting'] &&
        props.vestingBalance.value['base_vesting_account']['delegated_vesting'].reduce((accumulator, currentValue) => {
            return accumulator + Number(currentValue.amount);
        }, 0);

    const vestingTokens = vesting - delegatedVesting;

    if (props.validator && (props.name === 'Undelegate' || props.name === 'Redelegate')) {
        const filterList = props.delegations.find((value) => value.delegation &&
            (value.delegation.validator_address === props.validator));
        if (filterList && filterList.balance && filterList.balance.amount) {
            staked = filterList.balance.amount;
        }
    }

    const disable = !props.validator || !props.amount || inProgress ||
        ((props.name === 'Delegate' || props.name === 'Stake' || props.name === 'Multi-Delegate') && vestingTokens
            ? props.amount > parseFloat((available + vestingTokens))
            : props.name === 'Delegate' || props.name === 'Stake' || props.name === 'Multi-Delegate'
                ? props.amount > parseFloat(available)
                : props.name === 'Undelegate' || props.name === 'Redelegate'
                    ? props.amount > parseFloat(staked) : false);

    return (
        <Dialog
            aria-describedby="delegate-dialog-description"
            aria-labelledby="delegate-dialog-title"
            className="dialog delegate_dialog"
            open={props.open}
            onClose={props.handleClose}>
            {inProgress && <CircularProgress className="full_screen"/>}
            <DialogContent className="content">
                <h1>{props.name + ' ' + variables[props.lang].tokens}</h1>
                {props.name === 'Redelegate'
                    ? <>
                        <p>From validator</p>
                        <ValidatorSelectField/>
                        <p>To validator</p>
                        <ToValidatorSelectField/>
                    </>
                    : props.name === 'Multi-Delegate'
                        ? <>
                            <p>Select Multi Validators</p>
                            <MultiValidatorSelectField />
                        </>
                        : <>
                            <p>Choose the validator</p>
                            <ValidatorSelectField/>
                        </>
                }
                <p>Enter tokens to {props.name || 'Delegate'}</p>
                <TokensTextField/>
            </DialogContent>
            <DialogActions className="footer">
                <Button
                    disabled={disable}
                    variant="contained"
                    onClick={props.name === 'Multi-Delegate' ? handleMultiDelegate : handleDelegateType}>
                    {inProgress
                        ? variables[props.lang]['approval_pending']
                        : props.name}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DelegateDialog.propTypes = {
    balance: PropTypes.array.isRequired,
    delegations: PropTypes.array.isRequired,
    details: PropTypes.object.isRequired,
    failedDialog: PropTypes.func.isRequired,
    fetchRewards: PropTypes.func.isRequired,
    fetchVestingBalance: PropTypes.func.isRequired,
    genesisValidatorList: PropTypes.object.isRequired,
    getBalance: PropTypes.func.isRequired,
    getDelegatedValidatorsDetails: PropTypes.func.isRequired,
    getDelegations: PropTypes.func.isRequired,
    getUnBondingDelegations: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    pendingDialog: PropTypes.func.isRequired,
    selectedMultiValidatorArray: PropTypes.array.isRequired,
    showMessage: PropTypes.func.isRequired,
    successDialog: PropTypes.func.isRequired,
    vestingBalance: PropTypes.object.isRequired,
    address: PropTypes.string,
    amount: PropTypes.any,
    toValidator: PropTypes.string,
    validator: PropTypes.string,
};

const stateToProps = (state) => {
    return {
        balance: state.accounts.balance.result,
        delegations: state.accounts.delegations.result,
        lang: state.language,
        open: state.stake.delegateDialog.open,
        name: state.stake.delegateDialog.name,
        address: state.accounts.address.value,
        amount: state.stake.tokens,
        validator: state.stake.validator.value,
        vestingBalance: state.accounts.vestingBalance.result,
        toValidator: state.stake.toValidator.value,
        selectedMultiValidatorArray: state.stake.selectMultiValidators.list,
        details: state.accounts.address.details,
        genesisValidatorList: state.stake.genesisValidators.list,
    };
};

const actionToProps = {
    handleClose: hideDelegateDialog,
    successDialog: showDelegateSuccessDialog,
    failedDialog: showDelegateFailedDialog,
    pendingDialog: showDelegateProcessingDialog,
    fetchVestingBalance,
    fetchRewards,
    getBalance,
    getDelegations,
    getDelegatedValidatorsDetails,
    getUnBondingDelegations,
    showMessage,
    selectMultiValidators,
};

export default connect(stateToProps, actionToProps)(DelegateDialog);
