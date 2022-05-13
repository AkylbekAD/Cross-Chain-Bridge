import hre from 'hardhat';
const ethers = hre.ethers;

const RinkebyChainBridgeAddress = "0xE0FcDbf2F50cdBCd44C1bbc91bB2d5A0754A15A5"
const BinanceSmartChainBridgeAddress = "0x2d8ecB8Dd7a70E49f70F5224AF7573078Ec20052"

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