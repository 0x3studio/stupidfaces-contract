import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY || "";
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [MAINNET_PRIVATE_KEY],
    },
  },
};

export default config;
