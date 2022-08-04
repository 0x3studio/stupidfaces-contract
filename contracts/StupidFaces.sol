// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "erc721a/contracts/ERC721A.sol";

contract StupidFaces is ERC721A, Ownable {
    enum Step {
        Prologue,
        Sale,
        Epilogue
    }

    Step public currentStep;

    string public baseURI;

    uint256 private constant MAX_SUPPLY = 1000;

    uint256 public salePrice = 0.001 ether;
    uint256 public individualLimit = 10;
    uint256 public totalMinted = 0;

    mapping(address => uint256) public amountNFTsPerWallet;

    constructor() ERC721A("Stupid Faces", "STF") {}

    // Mint

    function mint(uint256 _quantity) external payable {
        address addr = msg.sender;
        uint256 price = salePrice;
        require(currentStep == Step.Sale, "Public sale is not active");
        require(
            amountNFTsPerWallet[addr] + _quantity <= individualLimit,
            string(
                abi.encodePacked(
                    "You can only get ",
                    Strings.toString(individualLimit),
                    " NFTs on the public sale"
                )
            )
        );
        require(
            totalMinted + _quantity <= MAX_SUPPLY,
            "Maximum supply exceeded"
        );
        require(msg.value >= price * _quantity, "Not enough funds");
        totalMinted += _quantity;
        amountNFTsPerWallet[addr] += _quantity;
        _safeMint(addr, _quantity);
    }

    function airdrop(address _addr, uint256 _quantity) external onlyOwner {
        require(
            amountNFTsPerWallet[_addr] + _quantity <= individualLimit,
            string(
                abi.encodePacked(
                    "You can only get ",
                    Strings.toString(individualLimit),
                    " NFTs on the public sale"
                )
            )
        );
        require(
            totalMinted + _quantity <= MAX_SUPPLY,
            "Maximum supply exceeded"
        );
        totalMinted += _quantity;
        amountNFTsPerWallet[_addr] += _quantity;
        _safeMint(_addr, _quantity);
    }

    // Utils

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, Strings.toString(_tokenId)));
    }

    // Getters and setters

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function getBaseURI() public view returns (string memory) {
        return baseURI;
    }

    function setSalePrice(uint256 _salePrice) external onlyOwner {
        salePrice = _salePrice;
    }

    function getSalePrice() public view returns (uint256) {
        return salePrice;
    }

    function setIndividualLimit(uint256 _individualLimit) external onlyOwner {
        individualLimit = _individualLimit;
    }

    function getIndividualLimit() public view returns (uint256) {
        return individualLimit;
    }

    function setCurrentStep(uint256 _currentStep) external onlyOwner {
        require(_currentStep > uint256(currentStep), "You can only go forward");
        currentStep = Step(_currentStep);
    }

    function getCurrentStep() public view returns (uint256) {
        return uint256(currentStep);
    }

    // Withdraw

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Overrides

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
