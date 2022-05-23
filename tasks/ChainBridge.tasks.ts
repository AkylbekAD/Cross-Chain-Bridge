import { task } from "hardhat/config";

const ChainBridgeAddress = "0x992A58374550483C6dA7Bfe67764fC7D8Afd3a17" // for RINKEBY testnetwork
/* 
const ChainBridgeAddress = "0x09801CF826d876E6cc2aa32f6127b099C8D0EA2C" // for BSC testnetwork
*/
task("updateERC20ById", "Update ERC20 address on chainId to 'true' or 'false' at ChainBridge")
    .addParam("id", "Chain id of blockchain")
    .addParam("address", "ERC20 address at certain blockchain")
    .addParam("bool", "Boolean value for validaton you want to set")
    .setAction(async (taskArgs, hre) => {
        const ChainBridgeInterface = await hre.ethers.getContractAt("ChainBridge", ChainBridgeAddress)
        await ChainBridgeInterface.updateERC20ById(taskArgs.id, taskArgs.address, taskArgs.bool)
        console.log(`Now on ${taskArgs.id} chain ${taskArgs.address} ERC20 token validation is equal ${taskArgs.bool}`)
    })

task("setNewValidator", "Setting new validator who would sign hashes for redeem")
    .addParam("address", "Address of validator")
    .setAction(async (taskArgs, hre) => {
        const ChainBridgeInterface = await hre.ethers.getContractAt("ChainBridge", ChainBridgeAddress)
        await ChainBridgeInterface.setNewValidator(taskArgs.address)
        console.log(`Now validator is ${taskArgs.address}`)
    })

task("swap", "Burns your ERC20 on current chain for minting them on other chain, emits SwapInitilized event")
    .addParam("recepient", "Address you want mint tokens to")
    .addParam("amount", "Amount of tokens ERC20 you want to swap")
    .addParam("idfrom", "id of chain ERC20 on from you want to swap")
    .addParam("erc20from", "ERC20 token you want to burn to swap")
    .addParam("erc20to", "ERC20 address you want mint to")
    .setAction(async (taskArgs, hre) => {
        const ChainBridgeInterface = await hre.ethers.getContractAt("ChainBridge", ChainBridgeAddress)
        await ChainBridgeInterface.swap(
            taskArgs.recepient,
            taskArgs.amount,
            taskArgs.idfrom,
            taskArgs.erc20from,
            taskArgs.erc20to,
            )
        console.log(`You have swaped ${taskArgs.amount} tokens of ERC20 ${taskArgs.erc20from} to ${taskArgs.recepient} at ${taskArgs.erc20to}`)
    })

task("redeem", "Mints ERC20 token from hash which created by SwapInitilized event")
    .addParam("recepient", "Address you want mint tokens to")
    .addParam("amount", "Amount of tokens ERC20 you want to redeem")
    .addParam("idfrom", "id of chain ERC20 on from you want to redeem")
    .addParam("erc20from", "Address you want to make admin")
    .addParam("erc20to", "Address you want to make admin")
    .addParam("v", "v")
    .addParam("r", "r")
    .addParam("s", "s")
    .setAction(async (taskArgs, hre) => {
        const ChainBridgeInterface = await hre.ethers.getContractAt("ChainBridge", ChainBridgeAddress)
        await ChainBridgeInterface.redeem(
            taskArgs.recepient,
            taskArgs.amount,
            taskArgs.idfrom,
            taskArgs.erc20from,
            taskArgs.erc20to,
            taskArgs.v,
            taskArgs.r,
            taskArgs.s
            )
        console.log(`You have redeemed ${taskArgs.amount} tokens of ERC20 ${taskArgs.erc20to} to ${taskArgs.recepient}`)
    })

task("revokeAdminRights", "Revoke rights for admins only functions")
    .addParam("address", "Address you want to revoke admin rights")
    .setAction(async (taskArgs, hre) => {
        const ChainBridgeInterface = await hre.ethers.getContractAt("ChainBridge", ChainBridgeAddress)
        await ChainBridgeInterface.revokeAdminRights(taskArgs.address)
        console.log(`You have revoke Admin rights from ${taskArgs.address}`)
    })

task("giveAdminRights", "Give rights for admins only functions")
    .addParam("address", "Address you want to give admin rights")
    .setAction(async (taskArgs, hre) => {
        const ChainBridgeInterface = await hre.ethers.getContractAt("ChainBridge", ChainBridgeAddress)
        await ChainBridgeInterface.giveAdminRights(taskArgs.address)
        console.log(`You have give Admin rights to ${taskArgs.address}`)
    })

task("isERC20valid", "Returns boolean value is ERC20 contract valid on certain chain id")
    .addParam("id", "Chain id")
    .addParam("address", "Address of ERC20 contract")
    .setAction(async (taskArgs, hre) => {
        const ChainBridgeInterface = await hre.ethers.getContractAt("ChainBridge", ChainBridgeAddress)
        const result = await ChainBridgeInterface.isERC20valid(taskArgs.id, taskArgs.address)
        console.log(result)
    })