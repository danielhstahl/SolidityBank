pragma solidity ^0.4.4;


contract Loan {
	uint constant precision=1000;//eg, .04 is actually 40
	uint constant daysInYear=360;
	uint constant lambda=1100;//1.1, the rate at which to decline reputation
	modifier onlyOwner { if (msg.sender == owner) _; } //ensure only owner does some things
	uint public constant maxNumberOfPayments=24;//due to machine precision issues...
	uint loanNumber=1;
	uint public constant defaultRep=50;
	address public owner;
	function Loan(){
		owner=msg.sender;
	}
	event borrowerPenalized(address borrower, uint currentReputation);
	/**time being, only fixed rate*/
	struct LoanType {
		uint paymentsPerYear;
		uint totalPayments;
		uint totalPaymentsMade;
		uint annualRate;
		uint originationDate;
		uint payDate;
		uint principal;
		bool active;
	}
	struct Borrower {
		bool exists;
		uint reputation;
		//uint numLoans;
		uint[] loanNumbers;
		mapping (uint => LoanType) loans;
	}
	mapping (address => Borrower) private borrowers;
	address[] private borrowerAddresses;
	function getNumLoanForBorrower(address borrower) public constant returns(uint){
		return borrowers[borrower].loanNumbers.length;
	}
	function getReputation(address borrower) public constant returns(uint){
		return borrowers[borrower].reputation;
	}
	function getBorrowerLoanNumber(address borrower, uint index) public constant returns(uint){
		return borrowers[borrower].loanNumbers[index];
	}
	function pwPrecision(uint r, uint numPayments) public constant returns(uint){
		return ((precision+r)**numPayments)/(precision**(numPayments-1));
	}
	function getPeriodicRate(uint annualRate, uint paymentsPerYear) public constant returns(uint){
		return uint(annualRate/paymentsPerYear); 
	}
	function pmt(uint annualRate, uint paymentsPerYear, uint totalPayments, uint principal) public constant returns(uint){
		var r=getPeriodicRate(annualRate, paymentsPerYear);
		return principal*(r+(r*precision)/(pwPrecision(r, totalPayments)-precision)+1); //+1 is to account for rounding down
	}
	function balance(uint annualRate, uint paymentsPerYear, uint totalPaymentsMade, uint principal, uint pmt) public constant returns(uint){
		if(totalPaymentsMade==0){
			return principal*precision;
		}
		var r=getPeriodicRate(annualRate, paymentsPerYear);
		var pow=pwPrecision(r, totalPaymentsMade);
		return principal*pow-pmt*(pow-precision)/r;
	}
	function checkTimeToPay(uint payDate)  public constant returns(bool){
		return block.timestamp>payDate;
	}
	function calculateDaysTillNextPayDate(uint currDate, uint paymentsPerYear) public constant returns(uint){
		var numHoursInDay=24;
		var numMinutesInHour=60;
		var numSecondsInMinute=60;
		return (daysInYear/paymentsPerYear)*numHoursInDay*numMinutesInHour*numSecondsInMinute;
	}
	function iterateNextPayDate(uint currDate, uint paymentsPerYear) public constant returns(uint){
		return currDate+calculateDaysTillNextPayDate(currDate, paymentsPerYear);
	}
	function hasFinishedLoan(uint totalPaymentsMade, uint totalPayments) public constant returns(bool){
		return totalPaymentsMade>=totalPayments;
	}
	function checkSize(uint totalPayments) private{
		if(totalPayments>maxNumberOfPayments){
			throw;
		}
	}
	function numberOfBorrowers() public constant returns(uint){
		return borrowerAddresses.length;
	}
	function getBorrowerAtIndex(uint index) public constant returns(address){
		if(index>=borrowerAddresses.length){
			throw;
		}
		return borrowerAddresses[index];
	}
	function reputationHit(uint numberOfMissedPayments, uint reputation) public constant returns(uint){
		return ((precision**numberOfMissedPayments)*reputation)/(lambda**numberOfMissedPayments);
	}
	function computeNumberMissedPayments(address borrower, uint loanNumber) public constant returns(uint){
		var (paymentsMade, payAmount, payDate)=computeAmountNeededToPay(borrower, loanNumber);
		return paymentsMade-borrowers[borrower].loans[loanNumber].totalPaymentsMade;
	}
	function penalizeBorrower(address borrower, uint loanNumber) public payable onlyOwner{
		uint numberOfMissedPayments=computeNumberMissedPayments(borrower, loanNumber);
		if(numberOfMissedPayments>0){
			borrowers[borrower].reputation=reputationHit(numberOfMissedPayments, borrowers[borrower].reputation);
			borrowerPenalized(borrower, borrowers[borrower].reputation);
		}
	}
	function createLoan(uint paymentsPerYear, uint totalPayments, uint annualRate,uint principal) public payable{
		createLoan(paymentsPerYear, totalPayments, annualRate, principal, now);
	}
	function createLoan(uint paymentsPerYear, uint totalPayments, uint annualRate,uint principal, uint currDate)public payable{
		checkSize(totalPayments);
		if(borrowers[msg.sender].exists==false){ //doesn't exist
			borrowerAddresses.push(msg.sender);
			borrowers[msg.sender].exists=true;//Borrower(true, defaultRep);
			borrowers[msg.sender].reputation=defaultRep;
		}		
		borrowers[msg.sender].loanNumbers.push(loanNumber);//++;
		borrowers[msg.sender].loans[loanNumber]=LoanType(paymentsPerYear, totalPayments, 0, annualRate, currDate, calculateDaysTillNextPayDate(currDate, paymentsPerYear), principal, true);
		loanNumber++;
	}
	function createFakeLoan(uint paymentsPerYear, uint totalPayments, uint annualRate,uint principal) public payable{
		createLoan(paymentsPerYear, totalPayments, annualRate, principal, 0);
	}
	function checkSendFunds(bool hasError) private{
      if(hasError){
        throw;
      }
    }
	function computeAddedPayment(uint payAmount, uint am, uint currBalance) public constant returns(uint){
		if(currBalance<am){
			return payAmount+currBalance;
		}
		else{
			return payAmount+am;
		}
	}
	/**purposely not interest accruing*/
	function computeAmountNeededToPay(address borrower, uint loanNumber) public constant returns(uint, uint, uint){
		var loan=borrowers[borrower].loans[loanNumber];
		var payDate=loan.payDate;
		var totalPaymentsMade=loan.totalPaymentsMade;
		var am=pmt(loan.annualRate, loan.paymentsPerYear, loan.totalPayments, loan.principal);
		uint payAmount=0;
		while(checkTimeToPay(payDate)&&!hasFinishedLoan(totalPaymentsMade, loan.totalPayments)){
			var currBalance=balance(loan.annualRate, loan.paymentsPerYear, totalPaymentsMade, loan.principal, am);
			payAmount=computeAddedPayment(payAmount, am, currBalance);
			payDate=iterateNextPayDate(payDate, loan.paymentsPerYear);
			totalPaymentsMade++;
		}
		return(totalPaymentsMade, payAmount, payDate);
	}
	
	function payLoan(uint loanNumber) public payable{
		var (paymentsMade, payAmount, payDate)=computeAmountNeededToPay(msg.sender, loanNumber);
		borrowers[msg.sender].loans[loanNumber].totalPaymentsMade=paymentsMade; 
		borrowers[msg.sender].loans[loanNumber].payDate=payDate;
		if(payAmount>0){
			checkSendFunds(msg.sender.send(msg.value-payAmount));//pay back excess funds
		}
		if(hasFinishedLoan(paymentsMade, borrowers[msg.sender].loans[loanNumber].totalPayments)){
			borrowers[msg.sender].loans[loanNumber].active=false;
			borrowers[msg.sender].reputation++;
		}
	}	
}
