var Loan = artifacts.require("./Loan.sol");

contract('Ideal Loan', (accounts)=>{
  const payPerYear=12;
  const totalPay=24;//t
  const annualRate=40;//4%
  const principal=500;
  it("should create loan for account 0", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.createLoan.sendTransaction(payPerYear, totalPay, annualRate, principal, {value:3000000, gas:3000000}).then(()=> {
        return instance.getNumLoanForBorrower(accounts[0]).then((result)=>{
          assert.equal(result.c[0],1, "Loan not created");
        })
      });
        
    });
  });
  it("should create another loan for account 0", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.createLoan.sendTransaction(payPerYear, totalPay, annualRate, principal, {value:3000000, gas:3000000}).then(()=> {
        return instance.getNumLoanForBorrower(accounts[0]).then((result)=>{
          assert.equal(result.c[0],2, "two loans not created");
        })
      });
        
    });
  });
  it("should give account 0 a default 50 reputation", ()=>{
    return Loan.deployed().then((instance)=> {
        return instance.getReputation(accounts[0]).then((result)=>{
          assert.equal(result.c[0], 50, "Repuation not equal to 50");
        })
    });
  });
  it("should compute zero missed payments for new loan", ()=>{
    let loan;
    let loanNumber;
    const block=web3.eth.getBlock("latest");//(result)=>{
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return loan.getNumLoanForBorrower(accounts[0]);
    }).then((numLoans)=>{
      return loan.getBorrowerLoanNumber(accounts[0], numLoans.c[0]-1);
    }).then((loanNums)=>{
      loanNumber=loanNums.c[0];
      return loan.computeNumberMissedPayments(accounts[0], loanNumber);
    }).then((result)=>{
      assert.equal(result.c[0], 0, "missed payments not functioning")
    })
  });
});
contract('Stateless testing', (accounts)=>{
  const payPerYear=12;
  const totalPay=24;//t
  const annualRate=40;//4%
  const principal=500;
  it("When annual rate is 40 (4%) and number of payments per year is 12, the periodic rate should equal 3 (rounding down 40/12)", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.getPeriodicRate(annualRate, payPerYear);
    }).then((result)=>{
      assert.equal(result.c[0], 3, "periodic rate does not equal 3");
    });
  });
  it("When annual rate is 40 (4%), the number of payments per year is 12, and the term is 2 years the (1+.04/12)^24 should be 1074 (1.074)", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.getPeriodicRate(annualRate, payPerYear)
    }).then((rate)=>{
      return loan.pwPrecision(rate.c[0], totalPay);
    }).then((result)=>{
      assert.equal(result.c[0], 1074, "pwPrecision does not equal 1074");
    });
  });
  it("When annual rate is 40 (4%), the number of payments per year is 12, the term is 2 years, and the loan amount is 500, the payment should be 22000.  This includes a round up.", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((result)=>{
      assert.equal(result.c[0], 22000, "pmt does not equal 22000");
    });
  });
  it("With the same loan features as above and after one payment, the balance should equal 479500 (479.50)", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, 1, principal, pmt.c[0]);
    }).then((balance)=>{
      assert.equal(balance.c[0], 479500, "balance does not equal 479500");
    });
  });
  it("With the same loan features as above and after no payments, the balance should equal 500000 (500)", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, 0, principal, pmt.c[0]);
    }).then((balance)=>{
      assert.equal(balance.c[0], 500000, "balance does not equal 500000");
    });
  });
  it("With the same loan features as above and after 12 payments, the balance should equal 254000 (254)", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, 12, principal, pmt.c[0]);
    }).then((balance)=>{
      assert.equal(balance.c[0], 254000, "balance does not equal 254000");
    });
  });
  it("With the same loan features as above and after 23 payments, the balance should equal 14834 (14.834)", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, totalPay-1, principal, pmt.c[0]);
    }).then((balance)=>{
      assert.equal(balance.c[0], 14834, "balance does not equal 14834");
    });
  });
  it("With the same loan features as above, the seconds between due dates is 2592000", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.calculateDaysTillNextPayDate(payPerYear);
    }).then((result)=>{
      assert.equal(result.c[0], 2592000, "nextDate does not equal 2592000");
    });
  });
  it("should iterate dates so that after iteration the checkTimeToPay function returns false", ()=>{
    const block=web3.eth.getBlock("latest");//(result)=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.iterateNextPayDate(block.timestamp,payPerYear);
    }).then((nextPayDate)=>{
      return loan.checkTimeToPay(nextPayDate.c[0]);
    }).then((isTimeToPay)=>{
      assert.equal(isTimeToPay, false, "nextDate isn't working");
    })    
  });
  it("should compute reputation hit for 12 missed payments", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.reputationHit(12, 50);
    }).then((result)=>{
      assert.equal(result.c[0], 15, "reputation not functioning")
    })
  });
  it("should compute reputation hit for 24 missed payments", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.reputationHit(24, 50);
    }).then((result)=>{
      assert.equal(result.c[0], 5, "reputation not functioning")
    })
  });
});
contract('Past due Loan', (accounts)=>{
  const payPerYear=12;
  const totalPay=24;//t
  const annualRate=40;//4%
  const principal=500;
  it("should pay off the last loan for account 0.  This can only be tested if past due.", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.createFakeLoan.sendTransaction(payPerYear, totalPay, annualRate, principal, {value:3000000, gas:3000000});
    }).then((transaction)=> {
      return loan.getNumLoanForBorrower(accounts[0]);
    }).then((numLoans)=>{
      return loan.getBorrowerLoanNumber(accounts[0], numLoans.c[0]-1);
    }).then((loanNumber)=>{
      return loan.computeAmountNeededToPay(accounts[0], loanNumber.c[0]);
    }).then((amountsToPay)=>{
      assert.equal(amountsToPay[0].c[0], totalPay, "total payments does not equal 24");
      assert.equal(amountsToPay[1].c[0], (totalPay-1)*22000+14834, "total amount paid does not equal 520834");
      assert.equal(amountsToPay[2].c[0], 64800000, "total time does not equal 64800000");
    });
  });
  it("should compute number of missed payments for the last loan of account 0", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return loan.getNumLoanForBorrower(accounts[0]);
    }).then((numLoans)=>{
      return loan.getBorrowerLoanNumber(accounts[0], numLoans.c[0]-1);
    }).then((loanNums)=>{
      return loan.computeNumberMissedPayments(accounts[0], loanNums.c[0]);
    }).then((result)=>{
      assert.equal(result.c[0], totalPay, "missedPayments not functioning")
    })
  });
  it("should penalize account 0 for the missed payments", ()=>{
    const payPerYear=12;
    const totalPay=24;//two year loan
    const annualRate=40;//4%
    const principal=500;
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.numberOfBorrowers();
    }).then((numberOfBorrowers)=>{
      const numBorrowers=numberOfBorrowers.c[0];
      return Promise.all(
        Array.apply(null, Array(numBorrowers)).map((val, index)=>{
          let borrower;
          return loan.getBorrowerAtIndex(index).then((brwr)=>{
            borrower=brwr;
            return loan.getNumLoanForBorrower(borrower);
          }).then((nLoans)=>{
            const numLoans=nLoans.c[0];
            return Promise.all(
              Array.apply(null, Array(numLoans)).map((val, loanIndex)=>{
                let loanNumber;
                return loan.getBorrowerLoanNumber(borrower, loanIndex).then((lNumber)=>{
                  loanNumber=lNumber.c[0];
                  return loan.penalizeBorrower.sendTransaction(borrower, loanNumber, {value:3000000, gas:3000000});
                }).then((result)=>{
                  return 0;
                });
              })
            ).then(()=>{
              return loan.getReputation(borrower);
            }).then((reputation)=>{
              assert.equal(reputation.c[0], 5, "reputation not assigned correctly");
            });
          });
        })
      ).then((results)=>{
      });
    }).then((results)=>{
    })
  });
});
