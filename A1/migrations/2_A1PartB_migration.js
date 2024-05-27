const A1PartB = artifacts.require("A1PartB");

module.exports = function(deployer) {
  // Command Truffle to deploy the Smart Contract
  deployer.deploy(A1PartB);
};