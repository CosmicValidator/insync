import React, { Component } from 'react';
import DataTable from '../../components/DataTable';
import './index.css';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CircularProgress from '../../components/CircularProgress';
import UnDelegateButton from '../Home/TokenDetails/UnDelegateButton';
// import ReDelegateButton from '../Home/TokenDetails/ReDelegateButton';
import DelegateButton from './DelegateButton';
import { formatCount } from '../../utils/numberFormats';
import ValidatorName from './ValidatorName';
import { config } from '../../config';
import { Button } from '@material-ui/core';
import { showConnectDialog } from '../../actions/navBar';

class Table extends Component {
    render () {
        const options = {
            serverSide: false,
            print: false,
            fixedHeader: false,
            pagination: false,
            selectableRows: 'none',
            selectToolbarPlacement: 'none',
            sortOrder: {
                name: 'voting_power',
                direction: 'desc',
            },
            textLabels: {
                body: {
                    noMatch: this.props.inProgress
                        ? <CircularProgress/>
                        : !this.props.address
                            ? <Button
                                className="disconnect_button"
                                onClick={() => this.props.showConnectDialog()}>
                                Connect
                            </Button>
                            : <div className="no_data_table"> No data found </div>,
                    toolTip: 'Sort',
                },
                viewColumns: {
                    title: 'Show Columns',
                    titleAria: 'Show/Hide Table Columns',
                },
            },
        };

        const columns = [{
            name: 'validator',
            label: 'Validator',
            options: {
                sort: true,
                customBodyRender: (value, index) => (
                    <ValidatorName
                        index={index && index.rowIndex} name={value}
                        value={index.rowData && index.rowData.length && index.rowData[1]}/>
                ),
            },
        },
        //         {
        //     name: 'status',
        //     label: 'Status',
        //     options: {
        //         sort: false,
        //         customBodyRender: (value) => (
        //             <div
        //                 className={classNames('status', (value.jailed || value.status === 'BOND_STATUS_UNBONDED') ? 'red_status' : '')}
        //                 title={value.status === 'BOND_STATUS_UNBONDED' ? 'jailed'
        //                     : value.status === 'BOND_STATUS_UNBONDING' ? 'unbonding'
        //                         : value.status === 'BOND_STATUS_BONDED' ? 'active'
        //                             : value.status === 'BOND_STATUS_UNSPECIFIED' ? 'invalid'
        //                                 : ''}>
        //                 {value.status === 'BOND_STATUS_UNBONDED' ? 'jailed'
        //                     : value.status === 'BOND_STATUS_UNBONDING' ? 'unbonding'
        //                         : value.status === 'BOND_STATUS_BONDED' ? 'active'
        //                             : value.status === 'BOND_STATUS_UNSPECIFIED' ? 'invalid'
        //                                 : ''}
        //             </div>
        //         ),
        //     },
        // },
        {
            name: 'voting_power',
            label: 'Voting Power',
            options: {
                sort: true,
                customBodyRender: (value) => (
                    <div className="voting_power">
                        <p>{formatCount(value, true)}</p>
                    </div>
                ),
            },
        },
        //         {
        //     name: 'apr',
        //     label: 'APR %',
        //     options: {
        //         sort: true,
        //         customBodyRender: (value) => {
        //             let apr = Number(this.props.actualAPR) * Number(value);
        //             apr = Number(this.props.actualAPR) - apr;
        //             return apr ? apr.toFixed(2) + ' %' : '--';
        //         },
        //     },
        // },
        //         {
        //     name: 'commission',
        //     label: 'Commission',
        //     options: {
        //         sort: true,
        //         customBodyRender: (value) => (
        //             value ? value + '%' : '0%'
        //         ),
        //     },
        // },
        {
            name: 'tokens_staked',
            label: 'Tokens Staked',
            options: {
                sort: false,
                customBodyRender: (item) => {
                    let address = null;
                    if (this.props.genesisValidatorList && this.props.genesisValidatorList[item.address]) {
                        address = this.props.genesisValidatorList[item.address];
                    }
                    let value = null;
                    address && address.nam_address && this.props.delegations.map((val) => {
                        if (val && val.length && val[1] && (address.nam_address === val[1])) {
                            value = val[2];
                        }
                    });

                    return (
                        <div className={value ? 'tokens' : 'no_tokens'}>
                            {Number(value) || 'no tokens'}
                        </div>
                    );
                },
            },
        }, {
            name: 'action',
            label: 'Action',
            options: {
                sort: false,
                customBodyRender: (validatorAddress) => {
                    let value = null;
                    if (this.props.genesisValidatorList && this.props.genesisValidatorList[validatorAddress]) {
                        value = this.props.genesisValidatorList[validatorAddress];
                    }

                    return (
                        value && this.props.delegations.find((item) =>
                            (item && item.length && item[1]) === value.nam_address)
                            ? <div className="actions">
                                {/* <ReDelegateButton valAddress={validatorAddress}/> */}
                                {/* <span/> */}
                                <UnDelegateButton valAddress={validatorAddress}/>
                                <span/>
                                <DelegateButton valAddress={validatorAddress}/>
                            </div>
                            : value && value.nam_address
                                ? <div className="actions">
                                    <DelegateButton valAddress={validatorAddress}/>
                                </div> : null
                    );
                },
            },
        }];

        let dataToMap = this.props.active === 2
            ? this.props.delegatedValidatorList
            : this.props.active === 3
                ? this.props.inActiveValidators
                : this.props.validatorList;

        if (this.props.active === 2) {
            dataToMap = [];
            this.props.validatorList && this.props.validatorList.length && this.props.validatorList.map((val) => {
                if (val && val.address) {
                    let address = null;
                    if (this.props.genesisValidatorList && this.props.genesisValidatorList[val.address]) {
                        address = this.props.genesisValidatorList[val.address];
                    }
                    this.props.delegations && this.props.delegations.length &&
                    this.props.delegations.map((value) => {
                        if (value && value.length && value[1] && address &&
                            address.nam_address && (address.nam_address === value[1])) {
                            dataToMap.push(val);
                        }
                    });
                }
            });
        }

        const tableData = dataToMap && dataToMap.length
            ? dataToMap.map((item) =>
                [
                    // item.description && item.description.moniker,
                    item.address,
                    // item,
                    // parseFloat((Number(item.tokens) / (10 ** config.COIN_DECIMALS)).toFixed(1)),
                    parseFloat((Number(item.voting_power) / (10 ** config.COIN_DECIMALS)).toFixed(1)),
                    // item.commission && item.commission.commission_rates &&
                    // item.commission.commission_rates.rate,
                    // item.commission && item.commission.commission_rates &&
                    // item.commission.commission_rates.rate
                    //     ? parseFloat((Number(item.commission.commission_rates.rate) * 100).toFixed(2)) : null,
                    item,
                    item.address,
                ])
            : [];

        return (
            <div className="table">
                <DataTable
                    columns={columns}
                    data={tableData}
                    name="stake"
                    options={options}/>
            </div>
        );
    }
}

Table.propTypes = {
    active: PropTypes.number.isRequired,
    genesisValidatorList: PropTypes.object.isRequired,
    inProgress: PropTypes.bool.isRequired,
    lang: PropTypes.string.isRequired,
    showConnectDialog: PropTypes.func.isRequired,
    actualAPR: PropTypes.number,
    address: PropTypes.string,
    delegatedValidatorList: PropTypes.arrayOf(
        PropTypes.shape({
            operator_address: PropTypes.string,
            status: PropTypes.number,
            tokens: PropTypes.string,
            commission: PropTypes.shape({
                commission_rates: PropTypes.shape({
                    rate: PropTypes.string,
                }),
            }),
            delegator_shares: PropTypes.string,
            description: PropTypes.shape({
                moniker: PropTypes.string,
            }),
        }),
    ),
    delegations: PropTypes.arrayOf(
        PropTypes.shape({
            validator_address: PropTypes.string,
            balance: PropTypes.shape({
                amount: PropTypes.any,
                denom: PropTypes.string,
            }),
        }),
    ),
    home: PropTypes.bool,
    inActiveValidators: PropTypes.arrayOf(
        PropTypes.shape({
            operator_address: PropTypes.string,
            status: PropTypes.number,
            tokens: PropTypes.string,
            commission: PropTypes.shape({
                commission_rates: PropTypes.shape({
                    rate: PropTypes.string,
                }),
            }),
            delegator_shares: PropTypes.string,
            description: PropTypes.shape({
                moniker: PropTypes.string,
            }),
        }),
    ),
    validatorList: PropTypes.arrayOf(
        PropTypes.shape({
            operator_address: PropTypes.string,
            status: PropTypes.number,
            tokens: PropTypes.string,
            commission: PropTypes.shape({
                commission_rates: PropTypes.shape({
                    rate: PropTypes.string,
                }),
            }),
            delegator_shares: PropTypes.string,
            description: PropTypes.shape({
                moniker: PropTypes.string,
            }),
        }),
    ),
};

const stateToProps = (state) => {
    return {
        actualAPR: state.stake.apr.actualAPR,
        address: state.accounts.address.value,
        lang: state.language,
        validatorList: state.stake.validators.list,
        genesisValidatorList: state.stake.genesisValidators.list,
        inProgress: state.stake.validators.inProgress,
        delegations: state.accounts.delegations.result,
        delegatedValidatorList: state.stake.delegatedValidators.list,
        inActiveValidators: state.stake.inActiveValidators.list,
    };
};

const actionToProps = {
    showConnectDialog,
};

export default connect(stateToProps, actionToProps)(Table);
