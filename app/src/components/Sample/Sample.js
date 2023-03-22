import { useState, useContext } from "react";
import "./Sample.css";
const {
  executeTransaction,
  EthereumContext,
  log,
  queryData,
  convertPriceToEth,
} = require("react-solidity-xdc3");

function Sample() {
  const [submitting, setSubmitting] = useState(false);
  const { provider, account, invoice, plugin, cgo, usplus } =
    useContext(EthereumContext);
  console.log("invoice:::", invoice);

  const registerAssetUSPLUS = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _key = "USPLUS";
    let _address = "0x098db963654868ab3df79be0974cf97a6e8054bd";
    let response1 = await executeTransaction(
      invoice,
      provider,
      "updateKeymappings",
      [_key, _address],
      0
    );
    log("registerAssetUSPLUS", "hash", response1.txHash);
    setSubmitting(false);
  };

  const registerAssetPLI = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _key = "PLI";
    let _address = "0xb3db178db835b4dfcb4149b2161644058393267d";
    let response1 = await executeTransaction(
      invoice,
      provider,
      "updateKeymappings",
      [_key, _address],
      0
    );
    log("registerAssetPLI", "hash", response1.txHash);
    setSubmitting(false);
  };

  const registerAssetCGO = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _key = "CGO";
    let _address = "0xc58dd5c23a4dca5232557e36fd1a57896ffd40e4";
    let response1 = await executeTransaction(
      invoice,
      provider,
      "updateKeymappings",
      [_key, _address],
      0
    );
    log("registerAssetCGO", "hash", response1.txHash);
    setSubmitting(false);
  };

  const whiteList = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    // let _address = "0xc63b25b52efd1816ebfb25b4443c131df520d735";
    let _address ="0x4e1945cec2539a9be460ab0aa7bdc1eadebde75e";
    let response1 = await executeTransaction(
      invoice,
      provider,
      "setWhiteList",
      [_address, true],
      0
    );
    log("whiteList", "hash", response1.txHash);
    setSubmitting(false);
  };

  const createLoanRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _invoiceAmount = await convertPriceToEth("100", "ABC");
    let _loanEligibility = _invoiceAmount;
    let _loanToAcquire = _invoiceAmount;
    let _loanRequestedIn = "0xb3db178db835b4dfcb4149b2161644058393267d"; //Asset Adress
    let _tokenId = 1;
    let response1 = await executeTransaction(
      invoice,
      provider,
      "createLoanRequest",
      [
        _invoiceAmount,
        _loanEligibility,
        _loanToAcquire,
        _loanRequestedIn,
        _tokenId,
      ],
      0
    );
    log("createLoanRequest", "hash", response1.txHash);
    setSubmitting(false);
  };

  const AcceptLoanRequestAndLend = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _interestRate = 10;
    let _daysToExpire = 90;
    let _assets = 1; //Asset 0 XDC, 1 PLI, 2 CGO, 3 USPLUS
    let _loanReqId = 2;
    let _loanAmountOffered = await convertPriceToEth("100", "ABC");
    let response0 = await executeTransaction(
      plugin,
      provider,
      "approve",
      [invoice.address, _loanAmountOffered],
      0
    );
    if (response0.txHash) {
      let response1 = await executeTransaction(
        invoice,
        provider,
        "AcceptLoanRequestAndLend",
        [_loanReqId, _loanAmountOffered, _interestRate, _daysToExpire, _assets],
        0
      );
      log("AcceptLoanRequestAndLend", "hash", response1.txHash);
    }
    setSubmitting(false);
  };

  const isWhiteListed = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _address = 1;
    let response1 = await queryData(invoice, provider, "whitelist", [_address]);
    log("isWhiteListed", "hash", response1);
    setSubmitting(false);
  };

  const AcceptOrDenyLoanOffer = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _loanReqId = 1;
    let _status = 2; // 2 ACCEPTED, 3 DENIED
    let response0 = await executeTransaction(
      invoice,
      provider,
      "acceptOrDenyOffer",
      [_loanReqId, _status],
      0
    );
    log("AcceptOrDenyLoanOffer", "hash", response0);
    setSubmitting(false);
  };

  const LoanPayBack = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _amount = await convertPriceToEth("100", "ABC"); //2 Accepted, 5 DENIED
    let _loanReqId = 1;
    let _status = 3; // 3 PAYBACK
    let response0 = await executeTransaction(
      plugin,
      provider,
      "approve",
      [invoice.address, _amount],
      0
    );
    if (response0.txHash) {
      let response1 = await executeTransaction(
        invoice,
        provider,
        "loanPayBack",
        [_loanReqId, _amount, _status],
        0
      );
      log("LoanPayBack", "hash", response1);
    }
    setSubmitting(false);
  };

  const ClaimLoan = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _lendingId = 1;
    let response0 = await executeTransaction(
      invoice,
      provider,
      "claimLoan",
      [_lendingId],
      0
    );
    log("AcceptOrDenyLoanOffer", "hash", response0);
    setSubmitting(false);
  };

  const transferOwnership = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    let _newOwner = "0xb22e6413893a796714132a309cd7d4ec2ac4587b";
    let response0 = await executeTransaction(
      invoice,
      provider,
      "transferContractOwnership",
      [_newOwner],
      0
    );
    log("transferOwnership", "hash", response0);
    setSubmitting(false);
  };

  return (
    <div className="Container">
      <div>
        <h1>Register Assets USPLUS</h1>
        <br></br>
        <form onSubmit={registerAssetUSPLUS}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Registering.." : "Register Asset USPLUS"}
          </button>
        </form>
      </div>
      <div>
        <h1>Register Assets PLI</h1>
        <br></br>
        <form onSubmit={registerAssetPLI}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Registering.." : "Register Asset PLI"}
          </button>
        </form>
      </div>
      <div>
        <h1>Register Assets CGO</h1>
        <br></br>
        <form onSubmit={registerAssetCGO}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Registering.." : "Register Asset CGO"}
          </button>
        </form>
      </div>
      <div>
        <h1>White List Address</h1>
        <br></br>
        <form onSubmit={whiteList}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Whitelisting.." : "Whitelist address"}
          </button>
        </form>
      </div>
      <div>
        <h1>isWhitelisted</h1>
        <br></br>
        <form onSubmit={isWhiteListed}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Fetching.." : "is WhiteListed? "}
          </button>
        </form>
      </div>
      <div>
        <h1>Create Loan request</h1>
        <br></br>
        <form onSubmit={createLoanRequest}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating.." : "Create Loan request"}
          </button>
        </form>
      </div>

      <div>
        <h1>Accept Loan & Lend</h1>
        <br></br>
        <form onSubmit={AcceptLoanRequestAndLend}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Offering.." : "Offer Loan"}
          </button>
        </form>
      </div>

      <div>
        <h1>Accept or Deny offer</h1>
        <br></br>
        <form onSubmit={AcceptOrDenyLoanOffer}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Accepting.." : "Accept or Deny Offer"}
          </button>
        </form>
      </div>

      <div>
        <h1>Loan Pay Back</h1>
        <br></br>
        <form onSubmit={LoanPayBack}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Paying back.." : "Loan Pay Back"}
          </button>
        </form>
      </div>

      <div>
        <h1>Claim Loan</h1>
        <br></br>
        <form onSubmit={ClaimLoan}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Claiming.." : "Claim Loan"}
          </button>
        </form>
      </div>

      <div>
        <h1>Transfer Ownership</h1>
        <br></br>
        <form onSubmit={transferOwnership}>
          <button type="submit" disabled={submitting}>
            {submitting ? "Transferring.." : "Transfer Ownership"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Sample;
