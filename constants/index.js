const contractAddresses = require('./contractAddresses.json');
const abi = require('./abi.json');
const etherscanLink = {
	1: "https://etherscan.io/", // Mainnet.
	11155111: "https://sepolia.etherscan.io/", // Sepolia Testnet.
	31337: "", // Hardhat Local.
}

module.exports = {
	contractAddresses,
	abi,
	etherscanLink,
}
