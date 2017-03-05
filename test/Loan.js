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
  it("periodic rate should equal 33", ()=>{
    return Loan.deployed().then((instance)=> {
      const payPerYear=12;
      const annualRate=40;//4%
      //instance.pmt(annualRate, payPerYear, totalPay, principal).then((result)=>{
      return instance.getPeriodicRate(annualRate, payPerYear).then((result)=>{
        console.log(result);
        assert.equal(result.c[0], 3, "periodic rate does not equal 33");
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
});
