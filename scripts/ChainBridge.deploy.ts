import hre from 'hardhat';
const ethers = hre.ethers;

const ChainBridgeaddress = ""

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