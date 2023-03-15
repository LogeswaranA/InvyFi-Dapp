import { useState, useContext } from 'react';
import './Sample.css';
const { executeTransaction, EthereumContext, log, queryData, convertPriceToEth } = require('react-solidity-xdc3');

function Sample() {

  const [submitting, setSubmitting] = useState(false);
  const { provider, account, invoice, plugin, cgo, usplus } = useContext(EthereumContext);
  console.log("invoice:::", invoice)

  const registerAsset = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _key = "USPLUS";
    let _address = "0x098db963654868ab3df79be0974cf97a6e8054bd";
    let response1 = await executeTransaction(invoice, provider, 'updateKeymappings', [_key, _address], 0);
    log("registerAsset", "hash", response1.txHash)
    setSubmitting(false);
  }

  const whiteList = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _address = "0xc63b25b52efd1816ebfb25b4443c131df520d735";
    let response1 = await executeTransaction(invoice, provider, 'setWhiteList', [_address, true], 0);
    log("whiteList", "hash", response1.txHash)
    setSubmitting(false);
  }

  const createLoanRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _invoiceAmount = await convertPriceToEth("100", "ABC");
    let _loanEligibility = _invoiceAmount;
    let _loanToAcquire = _invoiceAmount;
    let _loanRequestedIn = "0xb3db178db835b4dfcb4149b2161644058393267d";   //Asset Adress
    let _tokenId = 1;
    let response1 = await executeTransaction(invoice, provider, 'createLoanRequest', [_invoiceAmount, _loanEligibility, _loanToAcquire, _loanRequestedIn, _tokenId], 0);
    log("createLoanRequest", "hash", response1.txHash)
    setSubmitting(false);
  }

  const AcceptLoanRequestAndLend = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _interestRate = 10;
    let _daysToExpire = 90;
    let _assets = 1;   //Asset 0 XDC, 1 PLI, 2 CGO, 3 USPLUS
    let _loanReqId = 1;
    let _loanAmountOffered = await convertPriceToEth("100", "ABC");
    let response0 = await executeTransaction(plugin, provider, 'approve', [invoice.address, _loanAmountOffered], 0);
    if (response0.txHash) {
      let response1 = await executeTransaction(invoice, provider, 'AcceptLoanRequestAndLend', [_loanReqId, _loanAmountOffered, _interestRate, _daysToExpire, _assets], 0);
      log("AcceptLoanRequestAndLend", "hash", response1.txHash)
    }
    setSubmitting(false);
  }

  const isWhiteListed = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _address = 1;
    let response1 = await queryData(invoice, provider, 'whitelist', [_address]);
    log("isWhiteListed", "hash", response1)
    setSubmitting(false);
  }

  const AcceptOrDenyLoanOffer = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _state = 2;   //2 Accepted, 5 DENIED
    let _loanReqId = 1;
    let response0 = await executeTransaction(invoice, provider, 'acceptOrDenyLoanOffer', [_loanReqId, _state], 0);
    log("AcceptOrDenyLoanOffer", "hash", response0)
    setSubmitting(false);
  }

  const LoanPayBack = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _amount = await convertPriceToEth("1000", "ABC");  //2 Accepted, 5 DENIED
    let _loanReqId = 1;
    let response0 = await executeTransaction(plugin, provider, 'approve', [invoice.address, _amount], 0);
    if(response0.txHash){
      let response1 = await executeTransaction(invoice, provider, 'loanPayBack', [_loanReqId, _amount], 0);
      log("LoanPayBack", "hash", response1)
    }
    setSubmitting(false);
  }

  const ClaimLoan = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _lendingId = 1;
    let response0 = await executeTransaction(invoice, provider, 'claimLoan', [_lendingId], 0);
    log("AcceptOrDenyLoanOffer", "hash", response0)
    setSubmitting(false);
  }
  
  

  return <div className="Container">
    <div>
      <h1>Register Assets</h1><br></br>
      <form onSubmit={registerAsset}>
        <button type="submit" disabled={submitting}>{submitting ? 'Registering..' : 'Register Asset'}</button>
      </form>
    </div>
    <div>
      <h1>White List Address</h1><br></br>
      <form onSubmit={whiteList}>
        <button type="submit" disabled={submitting}>{submitting ? 'Whitelisting..' : 'Whitelist address'}</button>
      </form>
    </div>
    <div>
      <h1>isWhitelisted</h1><br></br>
      <form onSubmit={isWhiteListed}>
        <button type="submit" disabled={submitting}>{submitting ? 'Fetching..' : 'is WhiteListed? '}</button>
      </form>
    </div>
    <div>
      <h1>Create Loan request</h1><br></br>
      <form onSubmit={createLoanRequest}>
        <button type="submit" disabled={submitting}>{submitting ? 'Creating..' : 'Create Loan request'}</button>
      </form>
    </div>

    <div>
      <h1>Accept Loan & Lend</h1><br></br>
      <form onSubmit={AcceptLoanRequestAndLend}>
        <button type="submit" disabled={submitting}>{submitting ? 'Offering..' : 'Offer Loan'}</button>
      </form>
    </div>

    <div>
      <h1>Accept or Deny offer</h1><br></br>
      <form onSubmit={AcceptOrDenyLoanOffer}>
        <button type="submit" disabled={submitting}>{submitting ? 'Accepting..' : 'Accept or Deny Offer'}</button>
      </form>
    </div>

    <div>
      <h1>Loan Pay Back</h1><br></br>
      <form onSubmit={LoanPayBack}>
        <button type="submit" disabled={submitting}>{submitting ? 'Paying back..' : 'Loan Pay Back'}</button>
      </form>
    </div>

    <div>
      <h1>Claim Loan</h1><br></br>
      <form onSubmit={ClaimLoan}>
        <button type="submit" disabled={submitting}>{submitting ? 'Claiming..' : 'Claim Loan'}</button>
      </form>
    </div>
  </div>
}



export default Sample;
