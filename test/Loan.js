var Loan = artifacts.require("./Loan.sol");

contract('Loan', (accounts)=>{
 
  it("should create loan", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//t
      const annualRate=40;//4%
      const principal=500;
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
      const payPerYear=12;
      const totalPay=24;//ten year loan
      const annualRate=40;//4%
      const principal=500;
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
  it("periodic rate should equal 3", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const annualRate=40;//4%
      //instance.pmt(annualRate, payPerYear, totalPay, principal).then((result)=>{
      return instance.getPeriodicRate(annualRate, payPerYear).then((result)=>{
        console.log(result);
        assert.equal(result.c[0], 3, "periodic rate does not equal 3");
        //done();
      });
      
    });
  });
  it("pwPrecision should equal 1074", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//ten year loan
      const annualRate=40;//4%
      const principal=500;
      return instance.getPeriodicRate(annualRate, payPerYear).then((rate)=>{
        return instance.pwPrecision(rate.c[0], totalPay).then((result)=>{
          //console.log(result);
          assert.equal(result.c[0], 1074, "pwPrecision does not equal 1074");
          //done();
        });
      });
    });
  });
  it("pmt should equal 22000", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//ten year loan
      const annualRate=40;//4%
      const principal=500;
      return instance.pmt(annualRate,payPerYear, totalPay, principal).then((result)=>{
        //console.log(result);
        assert.equal(result.c[0], 22000, "pmt does not equal 22000");
        //done();
      });
    });
  });
  it("balance should equal 479500", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//ten year loan
      const annualRate=40;//4%
      const principal=500;
      return instance.pmt(annualRate,payPerYear, totalPay, principal).then((result)=>{
        return instance.balance(annualRate, payPerYear, 1, principal, result.c[0]).then((result)=>{
          console.log(result);
          assert.equal(result.c[0], 479500, "balance does not equal 479500");
        });
      });
    });
  });
  it("balance should equal 500000", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//ten year loan
      const annualRate=40;//4%
      const principal=500;
      return instance.pmt(annualRate,payPerYear, totalPay, principal).then((result)=>{
        return instance.balance(annualRate, payPerYear, 0, principal, result.c[0]).then((result)=>{
          console.log(result);
          assert.equal(result.c[0], 500000, "balance does not equal 500000");
        });
      });
    });
  });
  it("balance should equal 254000", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//ten year loan
      const annualRate=40;//4%
      const principal=500;
      return instance.pmt(annualRate,payPerYear, totalPay, principal).then((result)=>{
        return instance.balance(annualRate, payPerYear, 12, principal, result.c[0]).then((result)=>{
          console.log(result);
          assert.equal(result.c[0], 254000, "balance does not equal 254000");
        });
      });
    });
  });
  it("balance should equal 14834", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//ten year loan
      const annualRate=40;//4%
      const principal=500;
      return instance.pmt(annualRate,payPerYear, totalPay, principal).then((result)=>{
        return instance.balance(annualRate, payPerYear, 23, principal, result.c[0]).then((result)=>{
          console.log(result);
          assert.equal(result.c[0], 14834, "balance does not equal 14834");
        });
      });
    });
  });
  it("should calculate days till next correctly", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      return instance.calculateDaysTillNextPayDate(0,payPerYear).then((result)=>{
        assert.equal(result.c[0], 2592000, "nextDate does not equal 2592000");
      });
    });
  });
  it("should pay off loan", ()=>{
    //web3.eth.defaultAccount=accounts[1];
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//two year loan
      const annualRate=40;//4%
      const principal=500;
      return instance.createFakeLoan.sendTransaction(payPerYear, totalPay, annualRate, principal, {value:3000000, gas:3000000}).then(()=> {
        return instance.getNumLoanForBorrower(accounts[0]).then((result)=>{
          return instance.getBorrowerLoanNumber(accounts[0], result.c[0]-1).then((loanNumber)=>{
            console.log(loanNumber);
            return instance.computeAmountNeededToPay(accounts[0], loanNumber.c[0]).then((result)=>{
              console.log(result);
              assert.equal(result[0].c[0], totalPay, "total payments does not equal 24");
              assert.equal(result[1].c[0], (totalPay-1)*22000+14834, "total amount paid does not equal 520834");
              assert.equal(result[2].c[0], 64800000, "total time does not equal 64800000");
            });
          })
        })
      });
    });
  });
  it("should compute reputation hit for 12", ()=>{
    //web3.eth.defaultAccount=accounts[1];
    return Loan.deployed().then((instance)=> {
      const totalPay=24;//two year loan
      return instance.reputationHit(12, 50).then((result)=>{
        console.log(result);
        assert.equal(result.c[0], 15, "reputation not functioning")
      })
    });
  });
  it("should compute reputation hit for 24", ()=>{
    //web3.eth.defaultAccount=accounts[1];
    return Loan.deployed().then((instance)=> {
      const totalPay=24;//two year loan
      return instance.reputationHit(24, 50).then((result)=>{
        console.log(result);
        assert.equal(result.c[0], 5, "reputation not functioning")
      })
    });
  });
  it("should compute number of missed payments", ()=>{
    //web3.eth.defaultAccount=accounts[1];
    return Loan.deployed().then((instance)=> {
      const totalPay=24;//two year loan
      return instance.computeNumberMissedPayments(accounts[0], 3).then((result)=>{
        assert.equal(result.c[0], totalPay, "missedPayments not functioning")
      })
    });
  });
 /* it("should not truncate greater than zero", ()=>{
    const totalPay=24;//two year loan
    return Loan.deployed().then((instance)=> {
      return instance.computeNumberMissedPayments(accounts[0], 3).then((numMissingPayments)=>{
        console.log(numMissingPayments);
        return instance.getReputation(accounts[0]).then((reputation)=>{
          console.log(reputation);
          return instance.truncateZero(reputation.c[0]-numMissingPayments.c[0]).then((result)=>{
            console.log(result);
            assert.equal(result.c[0], reputation.c[0]-numMissingPayments.c[0], "missedPayments not functioning")
          })
        });
      });
    });
  });*/
  it("should penalize", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const totalPay=24;//two year loan
      const annualRate=40;//4%
      const principal=500;
      /**Beginning of worst code ever! */
      return instance.numberOfBorrowers().then((result)=>{
        console.log("Total number of borrowers: ", result);
        return Promise.all(
          Array.apply(null, Array(result.c[0])).map((val, index)=>{
            console.log("Working on borrower number ", index);
            return instance.getBorrowerAtIndex(index).then((borrower)=>{
              console.log("Borrower found!  Address is ", borrower);
              return instance.getNumLoanForBorrower(borrower).then((numLoans)=>{
                console.log("The borrower has ", numLoans.c[0], " loans!");
                return Promise.all(
                  Array.apply(null, Array(numLoans.c[0])).map((val, loanIndex)=>{
                    console.log("Working on loan index ", loanIndex);
                    return instance.getBorrowerLoanNumber(borrower, loanIndex).then((loanNumber)=>{
                      console.log("Working on loan number ", loanNumber.c[0]);
                      return instance.penalizeBorrower.sendTransaction(borrower, loanNumber.c[0], {value:3000000, gas:3000000}).then(()=>{
                        console.log("Just ran a penalize check for ", borrower, " at loan number ", loanNumber.c[0]);
                        return 0;
                      });
                    });
                  })
                ).then(()=>{
                  console.log("Finished the check for all loans for borrower ", borrower);
                  return instance.getReputation(borrower).then((reputation)=>{
                    console.log(reputation);
                    return instance.defaultRep().then((defaultRep)=>{
                      console.log(defaultRep);
                      assert.equal(reputation.c[0], 5, "reputation not assigned correctly");
                    });
                  });
                });
              });
            });
          })
        ).then(()=>{
            return 0;
        });
      })
    });
  });
});
