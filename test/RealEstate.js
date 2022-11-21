const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => ethers.utils.parseEther(n.toString(), "ethers");

const ether = tokens

describe('RealEstate', () => {
    let realEstate
    let escrow
    let deployer
    let seller
    let nftID = 1
    let buyer
    let purchasePrice = ether(100)
    let escrowAmount = ether(20)

    beforeEach(async () => {
        // setup Accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0];
        seller = deployer;
        buyer = accounts[1];
        inspector = accounts[2];
        lender = accounts[3];

        // Load the contract to test
        const RealEstate = await ethers.getContractFactory("RealEstate");
        const Escrow = await ethers.getContractFactory("Escrow");

        // Deploy Contracts
        realEstate = await RealEstate.deploy();
        escrow = await Escrow.deploy(realEstate.address, nftID, purchasePrice, escrowAmount, seller.address, buyer.address, lender.address, inspector.address);

        // Seller Approved NFT
        transaction = await realEstate.connect(seller).approve(escrow.address, nftID)
        await transaction.wait()
    })

    describe("Deployment", async () => {
        it("sends an NFT to the seller / deployer", async () => {
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
        });
    })

     describe("Selling Real Estate", async () => {
        let transaction, balance

        it("executes a successful transaction", async () => {
            // expect seller is the owner of the NFT
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
            transaction = await escrow.connect(buyer).depositEarnest({ value: escrowAmount })
            console.log("Buyer Deposits Earnest Money")

            // check Escrow balance
            balance = await escrow.getBalance()
            console.log("escro balance:", ethers.utils.formatEther(balance))

            // Inspector updates the status
            transaction = await escrow.connect(inspector).updateInspectionStatus(true)
            await transaction.wait();
            console.log("Inspector updates status")

            transaction = await escrow.connect(buyer).finalizeSale();
            await transaction.wait();
            console.log("Buyer finalize sale")

            // expect buyer is the owner of the NFT after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)
        });
    })
});