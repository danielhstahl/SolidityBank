var ConvertLib = artifacts.require("./ConvertLib.sol");
var Loan = artifacts.require("./Loan.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, Loan);
  deployer.deploy(Loan);
};
