import Web3 from "web3";
import { create } from "ipfs-http-client";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load contract ABI and address from JSON files
const config = JSON.parse(
  await fs.readFile(new URL("./config.json", import.meta.url))
);
const A3 = JSON.parse(
  await fs.readFile(new URL("./build/contracts/A3.json", import.meta.url))
);
const contractAddr = config.contractAddr;

// Initialize IPFS client
const client = create("http://127.0.0.1:5001");

// Define MFS path and file prefix
const MFSPath = config.MFSPath;
const FILE_PREFIX = config.FilePrefix;

let myContract;

// Initialize Web3 instance
async function getWeb3Instance(httpProviderURL) {
  const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderURL));
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  return web3;
}

// Helper function to call contract methods
async function callContractMethodWithArg({
  contract,
  methodName,
  arg,
  from,
  gasEstimate,
}) {
  return contract.methods[methodName](arg).send({
    from,
    ...(!!gasEstimate && { gas: Math.floor(gasEstimate * 1.5) }),
  });
}

// Function to ensure the MFS directory exists
async function ensureMFSDirectoryExists() {
  try {
    await client.files.stat(MFSPath);
    console.log(`Directory ${MFSPath} already exists.`);
  } catch (error) {
    if (error.message.includes("file does not exist")) {
      await client.files.mkdir(MFSPath, { parents: true });
      console.log(`Created directory: ${MFSPath}`);
    } else {
      throw error;
    }
  }
}

// Function to store document on IPFS and call contract
async function storeDocumentOnIPFSAndCallContract(web3, document) {
  await ensureMFSDirectoryExists();

  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  const hashedDocument = web3.utils.soliditySha3(document);
  const signature = await web3.eth.sign(hashedDocument, defaultAccount);

  // Use MFS to write the file with FILE_PREFIX
  const fileName = `${FILE_PREFIX}${hashedDocument.slice(2)}`; // Remove '0x' prefix
  const filePath = `${MFSPath}/${fileName}`;
  await client.files.write(filePath, Buffer.from(signature), {
    create: true,
    parents: true,
  });

  // Get the CID of the file we just wrote
  const stat = await client.files.stat(filePath);
  const ipfsCid = stat.cid.toString();

  const gasEstimate = await myContract.methods
    .setIpfsCid(hashedDocument.slice(2))
    .estimateGas({ from: defaultAccount });
  await callContractMethodWithArg({
    contract: myContract,
    methodName: "setIpfsCid",
    arg: hashedDocument.slice(2),
    from: defaultAccount,
    gasEstimate,
  });

  console.log(`File stored in IPFS MFS at: ${filePath}`);
  console.log(`File CID: ${ipfsCid}`);
  return { filePath, ipfsCid };
}

// Function to retrieve document from IPFS
async function retrieveDocumentFromIPFS(web3) {
  const ipfsCid = await myContract.methods
    .getIpfsCid()
    .call({ from: web3.eth.defaultAccount });

  console.log(`Retrieving document with CID: ${ipfsCid}`);

  // Read the file from MFS
  const filePath = `${MFSPath}/${FILE_PREFIX}${ipfsCid}`;
  console.log(`Attempting to read file from: ${filePath}`);

  try {
    const chunks = [];
    for await (const chunk of client.files.read(filePath)) {
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf8");

    console.log("Raw signature:", raw);

    const r = raw.slice(0, 66);
    const s = "0x" + raw.slice(66, 130);
    let v = "0x" + raw.slice(130, 132);
    v = web3.utils.toDecimal(v);
    v = v + 27;

    console.log("r:", r);
    console.log("s:", s);
    console.log("v:", v);

    return { r, s, v };
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    console.log("Listing files in MFS:");
    await listIPFSFiles();
    throw error;
  }
}

// Function to verify document
async function verifyDocumentOnLocalGanache(web3, accountToBeVerified) {
  const { r, s, v } = await retrieveDocumentFromIPFS(web3);
  const hashedDocument = web3.utils.soliditySha3(
    "This is a purchase document!"
  );

  const recoveredAddress = await myContract.methods
    .verify(hashedDocument, v, r, s)
    .call();

  console.log("Recovered address:", recoveredAddress);
  console.log("Account to be verified:", accountToBeVerified);

  if (recoveredAddress.toLowerCase() === accountToBeVerified.toLowerCase()) {
    console.log(
      "Verification successful: The recovered address matches the account to be verified."
    );
  } else {
    console.log(
      "Verification failed: The recovered address does not match the account to be verified."
    );
  }
}

// Function to list files in IPFS MFS
async function listIPFSFiles() {
  console.log(`Listing files in IPFS MFS at path: ${MFSPath}`);
  try {
    for await (const file of client.files.ls(MFSPath)) {
      console.log(`- ${file.name} (CID: ${file.cid})`);
    }
  } catch (error) {
    console.error(`Error listing files: ${error.message}`);
  }
}

// Main function to orchestrate operations
const main = async (abi, contractAddr) => {
  const web3 = await getWeb3Instance(config.ganacheRPC);
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];

  // Set contract
  myContract = new web3.eth.Contract(abi, contractAddr, {
    from: web3.eth.defaultAccount,
  });

  const { filePath, ipfsCid } = await storeDocumentOnIPFSAndCallContract(
    web3,
    "This is a purchase document!"
  );

  console.log(`Document stored at: ${filePath}`);
  console.log(`Document CID: ${ipfsCid}`);

  await listIPFSFiles();

  setTimeout(async () => {
    try {
      await retrieveDocumentFromIPFS(web3);

      setTimeout(async () => {
        await verifyDocumentOnLocalGanache(web3, web3.eth.defaultAccount);
      }, 1500);
    } catch (error) {
      console.error("Error in retrieval or verification:", error);
    }
  }, 500);
};

main(A3.abi, contractAddr)
  .then(() => {
    console.log("Smart contract executed successfully");
  })
  .catch((e) => {
    console.error(e);
  });
