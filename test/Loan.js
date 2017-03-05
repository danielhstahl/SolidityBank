var Loan = artifacts.require("./Loan.sol");

contract('Loan', (accounts)=>{
  const payPerYear=12;
  const totalPay=24;//t
  const annualRate=40;//4%
  const principal=500;
  it("should create loan", ()=>{
    return Loan.deployed().then((instance)=> {
      
      return instance.createLoan.sendTransaction(payPerYear, totalPay, annualRate, principal, {value:3000000, gas:3000000}).then(()=> {
        return instance.getNumLoanForBorrower(accounts[0]).then((result)=>{
          console.log(result);
          assert.equal(result.c[0],1, "Loan not created");
          //done();
        })
      });
        
    });
  });
  it("should have two loans", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.createLoan.sendTransaction(payPerYear, totalPay, annualRate, principal, {value:3000000, gas:3000000}).then(()=> {
        return instance.getNumLoanForBorrower(accounts[0]).then((result)=>{
          console.log(result);
          assert.equal(result.c[0],2, "two loans not created");
          //done();
        })
      });
        
    });
  });
  it("should have 50 reputation", ()=>{
    return Loan.deployed().then((instance)=> {
        return instance.getReputation(accounts[0]).then((result)=>{
          console.log(result);
          assert.equal(result.c[0], 50, "Repuation not equal to 50");
          //done();
        })
    });
  });
  it("should compute zero missed payments", ()=>{
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
      console.log(result);
      assert.equal(result.c[0], 0, "missedPayments not functioning")
    })
  });
});
contract('Loan', (accounts)=>{
  const payPerYear=12;
  const totalPay=24;//t
  const annualRate=40;//4%
  const principal=500;
  it("periodic rate should equal 3", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.getPeriodicRate(annualRate, payPerYear);
    }).then((result)=>{
      console.log(result);
      assert.equal(result.c[0], 3, "periodic rate does not equal 3");
    });
  });
  it("pwPrecision should equal 1074", ()=>{
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
  it("pmt should equal 22000", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((result)=>{
      assert.equal(result.c[0], 22000, "pmt does not equal 22000");
    });
  });
  it("balance should equal 479500", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, 1, principal, pmt.c[0]);
    }).then((balance)=>{
      console.log(balance);
      assert.equal(balance.c[0], 479500, "balance does not equal 479500");
    });
  });
  it("balance should equal 500000", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, 0, principal, pmt.c[0]);
    }).then((balance)=>{
      console.log(balance);
      assert.equal(balance.c[0], 500000, "balance does not equal 500000");
    });
  });
  it("balance should equal 254000", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, 12, principal, pmt.c[0]);
    }).then((balance)=>{
      console.log(balance);
      assert.equal(balance.c[0], 254000, "balance does not equal 254000");
    });
  });
  it("balance should equal 14834", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.pmt(annualRate,payPerYear, totalPay, principal);
    }).then((pmt)=>{
      return loan.balance(annualRate, payPerYear, totalPay-1, principal, pmt.c[0]);
    }).then((balance)=>{
      console.log(balance);
      assert.equal(balance.c[0], 14834, "balance does not equal 14834");
    });
  });
  it("should calculate days till next correctly", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.calculateDaysTillNextPayDate(payPerYear);
    }).then((result)=>{
      assert.equal(result.c[0], 2592000, "nextDate does not equal 2592000");
    });
  });
  it("should iterate dates correctly", ()=>{
    const block=web3.eth.getBlock("latest");//(result)=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.iterateNextPayDate(block.timestamp,payPerYear);
    }).then((nextPayDate)=>{
      console.log(nextPayDate);
      return loan.checkTimeToPay(nextPayDate.c[0]);
    }).then((isTimeToPay)=>{
      console.log(isTimeToPay);
      assert.equal(isTimeToPay, false, "nextDate isn't working");
    })    
  });
  it("should compute reputation hit for 12", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.reputationHit(12, 50);
    }).then((result)=>{
      console.log(result);
      assert.equal(result.c[0], 15, "reputation not functioning")
    })
  });
  it("should compute reputation hit for 24", ()=>{
    return Loan.deployed().then((instance)=> {
      return instance.reputationHit(24, 50);
    }).then((result)=>{
      console.log(result);
      assert.equal(result.c[0], 5, "reputation not functioning")
    })
  });
});
contract('Loan', (accounts)=>{
  const payPerYear=12;
  const totalPay=24;//t
  const annualRate=40;//4%
  const principal=500;
  it("should pay off loan", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return instance.createFakeLoan.sendTransaction(payPerYear, totalPay, annualRate, principal, {value:3000000, gas:3000000});
    }).then((transaction)=> {
      console.log(transaction);
      return loan.getNumLoanForBorrower(accounts[0]);
    }).then((numLoans)=>{
      return loan.getBorrowerLoanNumber(accounts[0], numLoans.c[0]-1);
    }).then((loanNumber)=>{
      console.log(loanNumber);
      return loan.computeAmountNeededToPay(accounts[0], loanNumber.c[0]);
    }).then((amountsToPay)=>{
      console.log(amountsToPay);
      assert.equal(amountsToPay[0].c[0], totalPay, "total payments does not equal 24");
      assert.equal(amountsToPay[1].c[0], (totalPay-1)*22000+14834, "total amount paid does not equal 520834");
      assert.equal(amountsToPay[2].c[0], 64800000, "total time does not equal 64800000");
    });
  });
  it("should compute number of missed payments", ()=>{
    let loan;
    return Loan.deployed().then((instance)=> {
      loan=instance;
      return loan.getNumLoanForBorrower(accounts[0]);
    }).then((numLoans)=>{
      return loan.getBorrowerLoanNumber(accounts[0], numLoans.c[0]-1);
    }).then((loanNums)=>{
      console.log(loanNums);
      return loan.computeNumberMissedPayments(accounts[0], loanNums.c[0]);
    }).then((result)=>{
      assert.equal(result.c[0], totalPay, "missedPayments not functioning")
    })
  });
  it("should penalize", ()=>{
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
      console.log("Total number of borrowers: ", numBorrowers);
      return Promise.all(
        Array.apply(null, Array(numBorrowers)).map((val, index)=>{
          console.log("Working on borrower number ", index);
          let borrower;
          return loan.getBorrowerAtIndex(index).then((brwr)=>{
            borrower=brwr;
            console.log("Borrower found!  Address is ", borrower);
            return loan.getNumLoanForBorrower(borrower);
          }).then((nLoans)=>{
            const numLoans=nLoans.c[0];
            console.log("The borrower has ", numLoans, " loans!");
            return Promise.all(
              Array.apply(null, Array(numLoans)).map((val, loanIndex)=>{
                console.log("Working on loan index ", loanIndex);
                let loanNumber;
                return loan.getBorrowerLoanNumber(borrower, loanIndex).then((lNumber)=>{
                  loanNumber=lNumber.c[0];
                  console.log("Working on loan number ", loanNumber);
                  return loan.penalizeBorrower.sendTransaction(borrower, loanNumber, {value:3000000, gas:3000000});
                }).then((result)=>{
                  console.log(result);
                  console.log("Just ran a penalize check for ", borrower, " at loan number ", loanNumber);
                  return 0;
                });
              })
            ).then(()=>{
              console.log("Finished the check for all loans for borrower ", borrower);
              return loan.getReputation(borrower);
            }).then((reputation)=>{
              console.log(reputation);
              assert.equal(reputation.c[0], 5, "reputation not assigned correctly");
              return 0;
            });
          });
        })
      ).then((results)=>{
        console.log(results);
        return 0;
      });
    }).then((results)=>{
      console.log(results);
    })
  });
});
