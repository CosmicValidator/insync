import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import { initializeChain } from '../../helper';
import { getCosmosBalance, setCosmosAccountAddress, showSelectAccountDialog } from '../../actions/accounts';
import { connect } from 'react-redux';
import { showMessage } from '../../actions/snackbar';
import keplrIcon from '../../assets/keplr.png';
import variables from '../../utils/variables';

const KeplrConnectButton = (props) => {
    const [inProgress, setInProgress] = useState(false);

    const initKeplr = () => {
        setInProgress(true);
        initializeChain((error, addressList) => {
            setInProgress(false);
            if (error) {
                props.showMessage(error);

                return;
            }

            props.setAccountAddress(addressList[0] && addressList[0].address);
            props.getBalance(addressList[0] && addressList[0].address);
        });
    };

    return (
        <Button
            className="connect_button"
            disabled={inProgress}
            variant="contained"
            onClick={initKeplr}>
            <img alt="logo" src={keplrIcon}/>
            {inProgress ? variables[props.lang].connecting + '...' : variables[props.lang].keplr}
        </Button>
    );
};

KeplrConnectButton.propTypes = {
    getBalance: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    setAccountAddress: PropTypes.func.isRequired,
    showDialog: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired,
    proposalTab: PropTypes.bool,
    stake: PropTypes.bool,
};

const stateToProps = (state) => {
    return {
        lang: state.language,
    };
};

const actionsToProps = {
    showMessage,
    setAccountAddress: setCosmosAccountAddress,
    showDialog: showSelectAccountDialog,
    getBalance: getCosmosBalance,
};

export default connect(stateToProps, actionsToProps)(KeplrConnectButton);
