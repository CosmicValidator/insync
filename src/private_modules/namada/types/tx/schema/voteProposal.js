/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from '@dao-xyz/borsh';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length; var r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc; var d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') { r = Reflect.decorate(decorators, target, key, desc); } else { for (var i = decorators.length - 1; i >= 0; i--) { if (d = decorators[i]) { r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r; } } }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
export var SubmitVoteProposalMsgValue = /** @class */ (function () {
    function SubmitVoteProposalMsgValue (data) {
        Object.assign(this, data);
    }
    __decorate([
        field({ type: 'string' }),
    ], SubmitVoteProposalMsgValue.prototype, 'signer', void 0);
    __decorate([
        field({ type: 'u64' }),
    ], SubmitVoteProposalMsgValue.prototype, 'proposalId', void 0);
    __decorate([
        field({ type: 'string' }),
    ], SubmitVoteProposalMsgValue.prototype, 'vote', void 0);
    return SubmitVoteProposalMsgValue;
}());
