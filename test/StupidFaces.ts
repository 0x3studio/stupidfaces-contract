const { expect } = require("chai");
const { ethers } = require("hardhat");

let owner: any, addr1: any, addr2: any, stupidFaces: any;

describe("StupidFaces", function () {
  before(async () => {
    const [_owner, _addr1, _addr2] = await ethers.getSigners();
    owner = _owner;
    addr1 = _addr1;
    addr2 = _addr2;

    const StupidFaces = await ethers.getContractFactory("StupidFaces");
    stupidFaces = await StupidFaces.deploy();
    await stupidFaces.deployed();
  });

  it("Should allow setting and getting the current step of the pass contract", async () => {
    stupidFaces.setCurrentStep(1);

    const currentStep = await stupidFaces.getCurrentStep();

    expect(currentStep).to.equal(1);
  });

  it("Should not allow minting of ERC721 token if not enough funds sent", async () => {
    const mint = async () => {
      await stupidFaces.connect(addr1).mint(5, {
        value: ethers.utils.parseEther("0"),
      });
    };

    await expect(mint()).eventually.to.rejectedWith("Not enough funds");
  });

  it("Should not allow minting of ERC721 token if individual limit reached", async () => {
    const limit = await stupidFaces.getIndividualLimit();

    const mint = async () => {
      await stupidFaces.connect(addr1).mint(20, {
        value: ethers.utils.parseEther("0.02"),
      });
    };

    await expect(mint()).eventually.to.rejectedWith(
      `You can only get ${limit.toNumber()} NFTs on the public sale`
    );
  });

  it("Should allow minting of ERC721 token", async () => {
    await stupidFaces.connect(addr1).mint(5, {
      value: ethers.utils.parseEther("0.005"),
    });

    const balance = await stupidFaces.balanceOf(addr1.address);

    expect(balance.toNumber()).to.equal(5);
  });

  it("Should allow airdropping of ERC721 token", async () => {
    await stupidFaces.airdrop(addr2.address, 3);

    const balance = await stupidFaces.balanceOf(addr2.address);

    expect(balance.toNumber()).to.equal(3);
  });
});
