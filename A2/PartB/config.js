const path = require("path");

const CONTRACT_NAME = "vaibhav-a2-part-A";
const CHANNEL_NAME = "vaibhavchannel";
const walletPath = path.join(__dirname, "Org1");
const host = "localhost";
const port = 8000;
const identity = "Org1 Admin";

module.exports = {
  CONTRACT_NAME,
  CHANNEL_NAME,
  walletPath,
  host,
  port,
  identity,
};
