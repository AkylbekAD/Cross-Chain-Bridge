import hre from 'hardhat';
const ethers = hre.ethers;

const RinkebyChainBridgeAddress = "0x992A58374550483C6dA7Bfe67764fC7D8Afd3a17"
const BinanceSmartChainBridgeAddress = "0x09801CF826d876E6cc2aa32f6127b099C8D0EA2C"

async function main() {
    const [owner] = await ethers.getSigners()

    const ChainBridge = await ethers.getContractFactory('ChainBridge', owner)
    const chainbridge = await ChainBridge.deploy()
    await chainbridge.deployed()
    console.log(chainbridge.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });