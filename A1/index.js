const { Web3 } = require("web3");
const data = require("./data.json");
const A1PartB = require("./build/contracts/A1PartB.json");

const args = process.argv.slice(2);
console.log("args", args);

async function callContractMethodWithArg({ contract, methodName, arg, from }) {
  return contract.methods[methodName](arg).send({
    from,
  });
}

async function getWeb3Instance(httpProviderURL) {
  const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderURL));
  // setup default account as the first account on the chain
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  return web3;
}

const main = async (abi, contractAddr) => {
  const GANACHE_RPC_URL = data.ganacheRPC;
  const web3 = await getWeb3Instance(GANACHE_RPC_URL);

  const myContract = new web3.eth.Contract(abi, contractAddr, {
    from: web3.eth.defaultAccount,
  });

  // Call the storeDocument method
  const documentValue = data.validDocument;
  await callContractMethodWithArg({
    contract: myContract,
    methodName: "storeDocument",
    arg: documentValue,
    form: web3.eth.defaultAccount,
  });

  // Call the getDocumentValue method
  let getDocumentValue;
  if (args[0] != "bad") {
    // SUCCESS CASE: valid document
    getDocumentValue = documentValue;
  } else {
    // FAILURE CASE: invalid document
    getDocumentValue = data.invalidDocument;
  }
  console.log({getDocumentValue})

  callContractMethodWithArg({
    contract: myContract,
    methodName: "getDocument",
    arg: getDocumentValue,
    form: web3.eth.defaultAccount,
  })
    .then((receipt) => {
      console.log("TX passed >> receipt:", receipt);
      console.log("TX hash: ", receipt.transactionHash);
    })
    .catch((error) => {
      console.log("TX failed >> ", error);
    });
};

main(A1PartB.abi, data.contractAddr)
  .then(() => {
    console.log("Smart contract executed successfully");
  })
  .catch((e) => {
    console.error(e);
  });
