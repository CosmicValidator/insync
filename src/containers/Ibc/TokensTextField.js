import * as PropTypes from 'prop-types';
import React from 'react';
import TextField from '../../components/TextField';
import { setTokens } from '../../actions/stake';
import { cosmosConfig } from '../../config';
import { connect } from 'react-redux';

const TokensTextField = (props) => {
    const balance = props.balance && props.balance.length && props.balance.find((val) => val.denom === cosmosConfig.COIN_MINIMAL_DENOM);

    const available = (balance && balance.amount && Number(balance.amount));
    const availableTokens = available / (10 ** cosmosConfig.COIN_DECIMALS);

    return (
        <>
            <p>Enter tokens to Transfer</p>
            <TextField
                error={props.value > parseFloat(availableTokens)}
                errorText="Invalid Amount"
                id="tokens-text-field"
                name="tokens"
                type="number"
                value={props.value}
                onChange={props.onChange}/>
            <div className="available_tokens">
                <p className="heading">
                    Max Available tokens:
                </p>
                <p className="value" onClick={() => props.onChange(availableTokens)}>
                    {availableTokens}
                </p>
            </div>
        </>
    );
};

TokensTextField.propTypes = {
    lang: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    balance: PropTypes.array,
    value: PropTypes.any,
};

const stateToProps = (state) => {
    return {
        balance: state.accounts.balance.cosmos,
        lang: state.language,
        value: state.stake.tokens,
    };
};

const actionsToProps = {
    onChange: setTokens,
};

export default connect(stateToProps, actionsToProps)(TokensTextField);
