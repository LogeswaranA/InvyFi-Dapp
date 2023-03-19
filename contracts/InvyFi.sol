//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@goplugin/contracts/src/v0.8/PluginClient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract InvyFi is PluginClient, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    uint256 public constant ONE_DAY = 60 * 60 * 24;

    Counters.Counter private requestIds;
    Counters.Counter private lendingIds;

    // address
    address public owner;

    enum Assets {
        XDC,
        PLI,
        CGO,
        USPLUS
    }

    enum Status {
        INITIATED,
        OFFERED,
        ACCEPTED,
        PAYBACK,
        CLAIMED,
        DENIED,
        CANCELLED,
        CLOSED
    }

    struct Loan {
        uint256 loanReqId;
        uint256 invoiceAmount;
        uint256 loanEligibility;
        uint256 loanAcquired;
        address loanRequestedIn;
        uint256 currentPrincipal;
        uint256 initialPrincipal;
        uint256 interestRate;
        uint expiresAt;
        uint createdAt;
        address borrower;
        address lender;
        uint256 nftTokenId;
        Status status;
    }

    struct Lending {
        uint256 lendingId;
        uint256 loanReqId;
        uint256 lendingAmount;
        uint256 earnings;
        address lender;
        Status status;
        bool isLoanClaimedBack;
    }

    //Whitelist or dewhitelist the address
    mapping(address => bool) public whitelist;

    //to track the loan detials by id
    mapping(uint256 => Loan) public loanDetails;

    //to track the loan details by borrower
    mapping(address => Loan[]) public loanBorrower;

    //to track the lending details by id
    mapping(uint256 => Lending) public lendingDetails;

    //to track the lending details by issuer
    mapping(address => Lending[]) public loanIssuer;

    //to track the key value mapping pair for assets
    mapping(string => address) public keyMappings;

    receive() external payable {}

    constructor(address _pli) ReentrancyGuard() {
        setPluginToken(_pli);
        owner = msg.sender;
        requestIds.increment();
        lendingIds.increment();
    }

    //to update the key mappings
    function updateKeymappings(
        string memory _name,
        address _destination
    ) public {
        require(msg.sender == owner, "only owner can update");
        keyMappings[_name] = _destination;
        emit KeyAddressAdded(_name, _destination);
    }

    //to whitelist the address
    function setWhiteList(address _to, bool _flag) public {
        require(msg.sender == owner, "only owner can update");
        whitelist[_to] = _flag;
        emit WhiteListed(_to, _flag);
    }

    //Function to create loan requests by borrower
    function createLoanRequest(
        uint256 _invoiceAmount,
        uint256 _loanEligibility,
        uint256 _loanToAcquire,
        address _loanRequestedIn,
        uint256 _tokenId
    ) public whenNotPaused returns (uint256) {
        /* create the lending offer */
        uint256 _reqid = requestIds.current();
        loanDetails[requestIds.current()] = Loan(
            requestIds.current(),
            _invoiceAmount,
            _loanEligibility,
            _loanToAcquire,
            _loanRequestedIn,
            0,
            0,
            0,
            0,
            0,
            msg.sender,
            address(0),
            _tokenId,
            Status(0)
        );
        loanBorrower[msg.sender].push(loanDetails[requestIds.current()]);
        requestIds.increment();
        emit LoanRequested(msg.sender, _invoiceAmount, requestIds.current());
        return _reqid;
    }

    //Function to accept the loan request & transfer the funds to contract
    function AcceptLoanRequestAndLend(
        uint256 _loanReqId,
        uint256 _loanAmountOffered,
        uint256 _interestRate,
        uint256 _daysToExpire,
        Assets _assets
    ) public payable whenNotPaused {
        uint256 createdAt = block.timestamp;
        uint256 duration = ONE_DAY.mul(_daysToExpire);
        uint256 expiresAt = createdAt.add(duration);

        //Updating Loan request details
        loanDetails[_loanReqId].expiresAt = expiresAt;
        loanDetails[_loanReqId].createdAt = createdAt;
        loanDetails[_loanReqId].loanAcquired = _loanAmountOffered;
        loanDetails[_loanReqId].initialPrincipal = _loanAmountOffered;
        loanDetails[_loanReqId].currentPrincipal = _loanAmountOffered;
        loanDetails[_loanReqId].interestRate = _interestRate;
        loanDetails[_loanReqId].lender = msg.sender;

        //Loan offered
        loanDetails[_loanReqId].status = Status(1);

        if (_assets == Assets.PLI) {
            transferFundsToContract(_loanAmountOffered, keyMappings["PLI"]);
        }
        if (_assets == Assets.CGO) {
            transferFundsToContract(_loanAmountOffered, keyMappings["CGO"]);
        }
        if (_assets == Assets.USPLUS) {
            transferFundsToContract(_loanAmountOffered, keyMappings["USPLUS"]);
        }
        updateLenderDetails(_loanReqId, _loanAmountOffered);

        emit LendingOffered(
            msg.sender,
            _loanAmountOffered,
            lendingIds.current()
        );
    }

    //internal function for transferpayment
    function transferFundsToContract(
        uint256 _amount,
        address _tokenaddress
    ) internal {
        XRC20Balance(msg.sender, _tokenaddress, _amount);
        XRC20Allowance(msg.sender, _tokenaddress, _amount);
        SafeERC20.safeTransferFrom(
            IERC20(_tokenaddress),
            msg.sender,
            address(this),
            _amount
        );
    }

    //internal function to update lender information
    function updateLenderDetails(
        uint256 _loanReqId,
        uint256 _loanAmountOffered
    ) internal {
        lendingDetails[lendingIds.current()] = Lending(
            lendingIds.current(),
            _loanReqId,
            _loanAmountOffered,
            0,
            msg.sender,
            Status(1),
            false
        );
        loanIssuer[msg.sender].push(lendingDetails[lendingIds.current()]);
        lendingIds.increment();
    }

    //internal function to check XRC20 Balance
    function XRC20Balance(
        address _addrToCheck,
        address _currency,
        uint256 _AmountToCheckAgainst
    ) internal view {
        require(
            IERC20(_currency).balanceOf(_addrToCheck) >= _AmountToCheckAgainst,
            "InVyFy: insufficient currency balance"
        );
    }

    //internal function to check XRC20 Allowance
    function XRC20Allowance(
        address _addrToCheck,
        address _currency,
        uint256 _AmountToCheckAgainst
    ) internal view {
        require(
            IERC20(_currency).allowance(_addrToCheck, address(this)) >=
                _AmountToCheckAgainst,
            "InVyFy: insufficient allowance."
        );
    }

    //function to accept or deny loan offer
    function acceptOrDenyOffer(
        uint256 _loanReqId,
        Status _status
    ) public payable whenNotPaused {
        Loan memory l = loanDetails[_loanReqId];
        require(
            msg.sender == l.borrower,
            "Only Borrower can accept or Deny the offer"
        );
        require(
            l.status == Status(1),
            "Only Offered Loan can be accepted or denied"
        );
        //Set the loan
        loanDetails[_loanReqId].status = Status(_status);
        string memory _flag = "";
        if (_status == Status.ACCEPTED) {
            transferFundstoBorrowerOrLender(
                l.loanAcquired,
                l.loanRequestedIn,
                l.borrower
            );
            _flag = "ACCEPTED";
        }
        if (_status == Status.DENIED) {
            transferFundstoBorrowerOrLender(
                l.loanAcquired,
                l.loanRequestedIn,
                msg.sender
            );
            _flag = "DENIED";
        }

        emit LoanAcceptOrDenyStatus(msg.sender, _flag);
    }

    //internal function for transferpaymentback to borrower or Lender
    function transferFundstoBorrowerOrLender(
        uint256 _amount,
        address _tokenaddress,
        address _recipient
    ) internal {
        SafeERC20.safeTransfer(IERC20(_tokenaddress), _recipient, _amount);
    }

    //function for pay back loan amount
    function loanPayBack(
        uint256 _loanReqId,
        uint256 _amount,
        Status _status
    ) public payable whenNotPaused {
        Loan memory l = loanDetails[_loanReqId];
        require(msg.sender == l.borrower, "Only Borrower can pay back");
        require(
            l.status == Status(2),
            "Only Accepted Loan can pay back"
        );
        loanDetails[_loanReqId].status = Status(_status);
        transferFundsToContract(_amount, l.loanRequestedIn);
        emit LoanPaidBack(msg.sender, _loanReqId, _amount);
    }

    //function for claim the loan amount by issuer
    function claimLoan(uint256 _lendingId) public payable whenNotPaused {
        Lending memory l = lendingDetails[_lendingId];
        require(
            msg.sender == loanDetails[l.loanReqId].lender,
            "Only lender can claim back"
        );
        require(
            lendingDetails[_lendingId].isLoanClaimedBack == false,
            "Loan already claimed"
        );
        require(
            loanDetails[l.loanReqId].status == Status(3),
            "Only Paid Back Loan can be claimed by Lender"
        );

        lendingDetails[_lendingId].status = Status(4);
        lendingDetails[_lendingId].isLoanClaimedBack = true;
        transferFundstoBorrowerOrLender(
            lendingDetails[_lendingId].lendingAmount,
            loanDetails[l.loanReqId].loanRequestedIn,
            msg.sender
        );
        emit LoanClaimed(
            msg.sender,
            l.loanReqId,
            lendingDetails[_lendingId].lendingAmount
        );
    }

    //Event Listing....
    event KeyAddressAdded(string _symbol, address _destination);
    event LoanRequested(address _borrower, uint256 _amount, uint256 _reqid);
    event LendingOffered(address _lender, uint256 _amount, uint256 _lendingid);
    event LoanAcceptOrDenyStatus(address _borrower, string _status);
    event LoanPaidBack(address _borrower, uint256 _loanreqid, uint256 _amount);
    event LoanClaimed(address _lender, uint256 _loanreqid, uint256 _amount);
    event WhiteListed(address _to, bool _flag);
}
