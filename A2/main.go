/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-contract-api-go/metadata"
)

func main() {
	vaibhavAssetContract := new(VaibhavAssetContract)
	vaibhavAssetContract.Info.Version = "0.0.1"
	vaibhavAssetContract.Info.Description = "My Smart Contract"
	vaibhavAssetContract.Info.License = new(metadata.LicenseMetadata)
	vaibhavAssetContract.Info.License.Name = "Apache-2.0"
	vaibhavAssetContract.Info.Contact = new(metadata.ContactMetadata)
	vaibhavAssetContract.Info.Contact.Name = "Vaibhav Singh"

	chaincode, err := contractapi.NewChaincode(vaibhavAssetContract)
	chaincode.Info.Title = "t2-hyperledger chaincode"
	chaincode.Info.Version = "0.0.1"

	if err != nil {
		panic("Could not create chaincode from VaibhavAssetContract." + err.Error())
	}

	err = chaincode.Start()

	if err != nil {
		panic("Failed to start chaincode. " + err.Error())
	}
}
