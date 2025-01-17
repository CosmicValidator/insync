import { config, cosmosConfig } from '../config';

export const REST_URL = config.REST_URL;
export const RPC_URL = config.RPC_URL;

export const urlFetchDelegations = (address) => `${REST_URL}/cosmos/staking/v1beta1/delegations/${address}`;
export const urlFetchBalance = (address) => `${cosmosConfig.REST_URL}/cosmos/bank/v1beta1/balances/${address}`;
export const urlFetchVestingBalance = (address) => `${REST_URL}/cosmos/auth/v1beta1/accounts/${address}`;
export const urlFetchUnBondingDelegations = (address) => `${REST_URL}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;

export const urlFetchRewards = (address) => `${REST_URL}/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
export const urlFetchVoteDetails = (proposalId, address) => `${REST_URL}/cosmos/gov/v1beta1/proposals/${proposalId}/votes/${address}`;

export const VALIDATORS_LIST_URL = (page) => `${RPC_URL}/validators?h&page=${page || 1}&per_page=10000`;
export const GENESIS_VALIDATORS_LIST_URL = 'https://namada.info/shielded-expedition.88f17d1d14/output/genesis_tm_address_to_alias.json';
export const INACTIVE_VALIDATORS_URL = `${REST_URL}/cosmos/staking/v1beta1/validators?pagination.limit=1000&status=BOND_STATUS_UNBONDED`;
export const INACTIVE_VALIDATORS_UNBONDING_URL = `${REST_URL}/cosmos/staking/v1beta1/validators?pagination.limit=1000&status=BOND_STATUS_UNBONDING`;
export const getValidatorURL = (address) => `${REST_URL}/cosmos/staking/v1beta1/validators/${address}`;
export const PROPOSALS_LIST_URL = `${REST_URL}/cosmos/gov/v1/proposals?pagination.limit=1000`;
export const getDelegatedValidatorsURL = (address) => `${REST_URL}/cosmos/staking/v1beta1/delegators/${address}/validators`;
export const urlFetchProposalVotes = (id) => `${REST_URL}/cosmos/gov/v1beta1/proposals/${id}/votes`;
export const urlFetchTallyDetails = (id) => `${REST_URL}/cosmos/gov/v1beta1/proposals/${id}/tally`;
export const urlFetchProposalDetails = (id) => `${REST_URL}/cosmos/gov/v1/proposals/${id}`;

export const validatorImageURL = (id) => `https://keybase.io/_/api/1.0/user/lookup.json?fields=pictures&key_suffix=${id}`;

export const urlFetchTimeoutHeight = (url, channel) => {
    let version = 'v1';
    if (url.indexOf('bluenet') > -1) {
        version = 'v1beta1';
    }

    return `${url}/ibc/core/channel/${version}/channels/${channel}/ports/transfer`;
};
