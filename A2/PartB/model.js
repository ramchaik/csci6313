const { getActorConnection } = require("./lib/hyperledger");

async function createAsset(id, value) {
  let contract = await getActorConnection();
  try {
    await contract.submitTransaction("CreateVaibhavAsset", id, value);
    return `Asset ${id} was successfully created!`;
  } catch (error) {
    throw error;
  }
}

async function updateAsset(id, value) {
  let contract = await getActorConnection();
  try {
    await contract.submitTransaction("UpdateVaibhavAsset", id, value);
    return `Asset ${id} was successfully updated!`;
  } catch (error) {
    throw error;
  }
}

async function readAsset(id) {
  let contract = await getActorConnection();
  try {
    return await contract.evaluateTransaction("ReadVaibhavAsset", id);
  } catch (error) {
    throw error;
  }
}

async function deleteAsset(id) {
  let contract = await getActorConnection();
  try {
    await contract.submitTransaction("DeleteVaibhavAsset", id);
    return `Asset ${id} was successfully deleted!`;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAsset,
  updateAsset,
  readAsset,
  deleteAsset,
};
