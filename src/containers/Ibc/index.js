import React, { useState } from 'react';
import './index.css';
import NavBar from '../NavBar';
import KeplrConnectButton from './KeplrConnectButton';
import variables from '../../utils/variables';
import Long from 'long';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { cosmosConfig } from '../../config';
import CopyButton from '../../components/CopyButton/TextButton';
import { Button } from '@material-ui/core';
import { disconnectCosmosSet, fetchTimeoutHeight, getCosmosBalance, signIBCTx } from '../../actions/accounts';
import TokensTextField from './TokensTextField';
import { showMessage } from '../../actions/snackbar';

const Ibc = (props) => {
    const [inProgress, setInProgress] = useState(false);

    const handleDisconnect = () => {
        localStorage.removeItem('of_co_address');
        localStorage.removeItem('of_co_wallet');
        props.disconnectSet();
    };

    const handleDeposit = () => {
        setInProgress(true);
        props.fetchTimeoutHeight(cosmosConfig.REST_URL, 'channel-37', (result) => {
            const revisionNumber = result && result.proof_height && result.proof_height.revision_number &&
                Long.fromNumber(result.proof_height.revision_number);
            const revisionHeight = result && result.proof_height && result.proof_height.revision_height;

            const data = {
                msg: {
                    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
                    value: {
                        source_port: 'transfer',
                        source_channel: 'channel-1109',
                        token: {
                            denom: cosmosConfig.COIN_MINIMAL_DENOM,
                            amount: String(props.amount * (10 ** cosmosConfig.COIN_DECIMALS)),
                        },
                        sender: props.address,
                        receiver: props.ibcAddress,
                        timeout_height: {
                            revisionNumber: revisionNumber || undefined,
                            revisionHeight: Long.fromNumber(parseInt(revisionHeight) + 150) || undefined,
                        },
                        timeout_timestamp: undefined,
                    },
                },
                fee: {
                    amount: [{
                        amount: String(455000),
                        denom: cosmosConfig.COIN_MINIMAL_DENOM,
                    }],
                    gas: String(450000),
                },
                memo: '',
            };

            const config = {
                RPC_URL: cosmosConfig.RPC_URL,
                REST_URL: cosmosConfig.REST_URL,
                CHAIN_ID: cosmosConfig.CHAIN_ID,
                CHAIN_NAME: cosmosConfig.CHAIN_NAME,
                COIN_DENOM: cosmosConfig.COIN_DENOM,
                COIN_MINIMAL_DENOM: cosmosConfig.COIN_MINIMAL_DENOM,
                COIN_DECIMALS: cosmosConfig.COIN_DECIMALS,
                PREFIX: cosmosConfig.PREFIX,
            };

            const denom = config.COIN_MINIMAL_DENOM;
            let balance = props.balance && props.balance.length && denom &&
                props.balance.find((val) => val.denom === denom);
            balance = balance && balance.amount;
            // const explorer = props.value && props.value.network && props.value.network.explorer;

            props.sign(config, data, (result) => {
                if (result) {
                    props.getBalance(props.address);
                    const time = setInterval(() => {
                        props.getBalance(props.address, (resBalance) => {
                            let resultBalance = resBalance && resBalance.length && denom &&
                                resBalance.find((val) => val.denom === denom);
                            resultBalance = resultBalance && resultBalance.amount;
                            if (resultBalance !== balance) {
                                setInProgress(false);
                                props.showMessage('Transaction Successful', 'success', result && result.transactionHash);
                                props.getBalance(props.address);
                                clearInterval(time);
                            }
                        });
                    }, 5000);
                } else {
                    setInProgress(false);
                }
            });
        });
    };

    const balance = props.balance && props.balance.length && props.balance.find((val) => val.denom === cosmosConfig.COIN_MINIMAL_DENOM);

    const available = (balance && balance.amount && Number(balance.amount));
    const availableTokens = available / (10 ** cosmosConfig.COIN_DECIMALS);

    const disable = !props.amount || inProgress || props.amount > parseFloat(availableTokens);
    return (
        <>
            <NavBar/>
            <div className="ibc padding">
                <div className="card">
                    <div className="left_content">
                        <h2>{variables[props.lang]['cosmos_ibc_transfer']}</h2>
                    </div>
                    {props.address
                        ? <div className="address_info">
                            <div className="select_fields">
                                <p className="token_name">{cosmosConfig.NETWORK_NAME}</p>
                                <span className="divider"/>
                                <div className="hash_text" title={props.address}>
                                    <p className="name">{props.address}</p>
                                    {props.address &&
                                        props.address.slice(props.address.length - 6, props.address.length)}
                                </div>
                                <CopyButton data={props.address}>
                                    {variables[props.lang].copy}
                                </CopyButton>
                            </div>
                            <Button
                                className="disconnect_button"
                                variant="contained"
                                onClick={handleDisconnect}>
                                {variables[props.lang].disconnect}
                            </Button>
                        </div>
                        : <KeplrConnectButton/>}
                    <div className="text_field_content">
                        <TokensTextField/>
                    </div>
                    <div className="footer">
                        <Button
                            className="submit_button"
                            disabled={disable}
                            variant="contained"
                            onClick={handleDeposit}>
                            {inProgress
                                ? variables[props.lang]['approval_pending']
                                : variables[props.lang].submit}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

Ibc.propTypes = {
    disconnectSet: PropTypes.func.isRequired,
    fetchTimeoutHeight: PropTypes.func.isRequired,
    getBalance: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    showMessage: PropTypes.func.isRequired,
    sign: PropTypes.func.isRequired,
    address: PropTypes.string,
    amount: PropTypes.any,
    balance: PropTypes.array,
    ibcAddress: PropTypes.string,
};

const stateToProps = (state) => {
    return {
        address: state.accounts.address.cosmosAddress,
        ibcAddress: state.accounts.address.value,
        lang: state.language,
        balance: state.accounts.balance.cosmos,
        amount: state.stake.tokens,
    };
};

const actionsToProps = {
    disconnectSet: disconnectCosmosSet,
    fetchTimeoutHeight,
    sign: signIBCTx,
    getBalance: getCosmosBalance,
    showMessage,
};

export default connect(stateToProps, actionsToProps)(Ibc);
