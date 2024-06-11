/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// VaibhavAssetContract contract for managing CRUD for VaibhavAsset
type VaibhavAssetContract struct {
	contractapi.Contract
}

// VaibhavAssetExists returns true when asset with given ID exists in world state
func (c *VaibhavAssetContract) VaibhavAssetExists(ctx contractapi.TransactionContextInterface, vaibhavAssetID string) (bool, error) {
	data, err := ctx.GetStub().GetState(vaibhavAssetID)

	if err != nil {
		return false, err
	}

	return data != nil, nil
}

// CreateVaibhavAsset creates a new instance of VaibhavAsset
func (c *VaibhavAssetContract) CreateVaibhavAsset(ctx contractapi.TransactionContextInterface, vaibhavAssetID string, value string) error {
	exists, err := c.VaibhavAssetExists(ctx, vaibhavAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The asset %s already exists", vaibhavAssetID)
	}

	vaibhavAsset := new(VaibhavAsset)
	vaibhavAsset.Value = value

	bytes, _ := json.Marshal(vaibhavAsset)

	return ctx.GetStub().PutState(vaibhavAssetID, bytes)
}

// ReadVaibhavAsset retrieves an instance of VaibhavAsset from the world state
func (c *VaibhavAssetContract) ReadVaibhavAsset(ctx contractapi.TransactionContextInterface, vaibhavAssetID string) (*VaibhavAsset, error) {
	exists, err := c.VaibhavAssetExists(ctx, vaibhavAssetID)
	if err != nil {
		return nil, fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return nil, fmt.Errorf("The asset %s does not exist", vaibhavAssetID)
	}

	bytes, _ := ctx.GetStub().GetState(vaibhavAssetID)

	vaibhavAsset := new(VaibhavAsset)

	err = json.Unmarshal(bytes, vaibhavAsset)

	if err != nil {
		return nil, fmt.Errorf("Could not unmarshal world state data to type VaibhavAsset")
	}

	return vaibhavAsset, nil
}

// UpdateVaibhavAsset retrieves an instance of VaibhavAsset from the world state and updates its value
func (c *VaibhavAssetContract) UpdateVaibhavAsset(ctx contractapi.TransactionContextInterface, vaibhavAssetID string, newValue string) error {
	exists, err := c.VaibhavAssetExists(ctx, vaibhavAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The asset %s does not exist", vaibhavAssetID)
	}

	vaibhavAsset := new(VaibhavAsset)
	vaibhavAsset.Value = newValue

	bytes, _ := json.Marshal(vaibhavAsset)

	return ctx.GetStub().PutState(vaibhavAssetID, bytes)
}

// DeleteVaibhavAsset deletes an instance of VaibhavAsset from the world state
func (c *VaibhavAssetContract) DeleteVaibhavAsset(ctx contractapi.TransactionContextInterface, vaibhavAssetID string) error {
	exists, err := c.VaibhavAssetExists(ctx, vaibhavAssetID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The asset %s does not exist", vaibhavAssetID)
	}

	return ctx.GetStub().DelState(vaibhavAssetID)
}
