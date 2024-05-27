// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract A1PartB {
    string public document;
    bytes32 public documentHash;

    struct DocumentResponse {
        string document;
        bytes32 hash;
    }

    function getHashForDocument(string memory doc) pure private returns (bytes32) {
        return keccak256(abi.encode(doc));
    }

    modifier checkDocumentHash(string memory _doc) {
        require(documentHash == getHashForDocument(_doc));
        _;
    }

    function storeDocument(string memory doc) public { 
        document = doc;
        documentHash = getHashForDocument(doc);
    }

    function getDocument(string memory doc) public view checkDocumentHash(doc) returns (DocumentResponse memory) {
        return DocumentResponse(document, documentHash);
    } 
}
