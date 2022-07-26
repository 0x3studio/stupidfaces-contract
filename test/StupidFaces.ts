const { expect } = require("chai");
const { ethers } = require("hardhat");

const BASE_URI = "ipfs://xyz/";

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

  it("Should not allow setting the current step to a previous step", async () => {
    await expect(stupidFaces.setCurrentStep(0)).eventually.to.rejectedWith(
      "You can only go forward"
    );
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

  it("Should allow setting the base URI and getting a token URI for an existent token", async () => {
    stupidFaces.setBaseURI(BASE_URI);

    const tokenURI = await stupidFaces.tokenURI(1);

    expect(tokenURI).to.equal(`${BASE_URI}1`);
  });

  it("Should not allow setting the base URI if it is already set", async () => {
    await expect(stupidFaces.setBaseURI(BASE_URI)).eventually.to.rejectedWith(
      "You can only set the base URI once"
    );
  });

  it("Should not allow getting a token URI for a nonexistent token", async () => {
    await expect(stupidFaces.tokenURI(666)).eventually.to.rejectedWith(
      "URI query for nonexistent token"
    );
  });

  it("Should allow airdropping of ERC721 token", async () => {
    await stupidFaces.airdrop(addr2.address, 3);

    const balance = await stupidFaces.balanceOf(addr2.address);

    expect(balance.toNumber()).to.equal(3);
  });
});
