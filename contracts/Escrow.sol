// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external;
}

contract Escrow {
    address public nftAddress;
    uint256 public nftID;
    uint256 public price;
    uint256 public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public lender;
    address public inspector;

    modifier onlyBuyer() {
        require(
            msg.sender == buyer,
            "Escrow: depositEarnest not called by buyer"
        );
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Escrow: not called by inspector");
        _;
    }

    bool public inspectionPassed = false;

    constructor(
        address _nftAddress,
        uint256 _nftID,
        uint256 _price,
        uint256 _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address _lender,
        address _inspector
    ) {
        nftAddress = _nftAddress;
        nftID = _nftID;
        price = _price;
        escrowAmount = _escrowAmount;
        seller = _seller;
        buyer = _buyer;
        lender = _lender;
        inspector = _inspector;
    }

    function depositEarnest() public payable onlyBuyer {
        require(
            msg.value >= escrowAmount,
            "Escrow: depositEarnest condition not met"
        );
    }

    function updateInspectionStatus(bool _passed) public onlyInspector {
        inspectionPassed = _passed;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Transfer ownership of property
    function finalizeSale() public {
        // Transfer ownership of property
        require(inspectionPassed, "Escrow: inspection not passed");
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }
}
