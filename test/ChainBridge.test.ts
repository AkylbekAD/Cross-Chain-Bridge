import chai from "chai"
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { solidity } from "ethereum-waffle"

chai.use(solidity);

describe("ChainBridge contract", function () {
  let ChainBridge;
  let ChainBridgeRIN: Contract;
  let ChainBridgeBSC: Contract;

  let owner: SignerWithAddress;
  let validator: SignerWithAddress;
  let acc1: SignerWithAddress;
  let acc2: SignerWithAddress;
  let acc3: SignerWithAddress;

  let Token;
  let TokenRINInterface: Contract;
  let TokenBSCInterface: Contract;

  const BURNER_ROLE = "0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848"
  const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
  let TokenRINaddress: string;
  let TokenBSCaddress: string;
  ///@dev event variable for redeem function tests
  let SwapInitialized: any;

  beforeEach(async function() {
    [owner, validator, acc1, acc2, acc3] = await ethers.getSigners()

    Token = await ethers.getContractFactory("ERC20")   
    TokenRINInterface = await Token.deploy()
    await TokenRINInterface.deployed()

    Token = await ethers.getContractFactory("ERC20"); 
    TokenBSCInterface = await Token.deploy()
    await TokenBSCInterface.deployed()

    ChainBridge = await ethers.getContractFactory("ChainBridge")
    ChainBridgeRIN = await ChainBridge.deploy()
    await ChainBridgeRIN.deployed()

    ChainBridge = await ethers.getContractFactory("ChainBridge");
    [owner, acc1, acc2] = await ethers.getSigners()    
    ChainBridgeBSC = await ChainBridge.deploy()
    await ChainBridgeBSC.deployed()

    await TokenRINInterface.grantRole(MINTER_ROLE, ChainBridgeRIN.address)
    await TokenRINInterface.grantRole(BURNER_ROLE, ChainBridgeRIN.address)
    await TokenBSCInterface.grantRole(MINTER_ROLE, ChainBridgeBSC.address)
    await TokenBSCInterface.grantRole(BURNER_ROLE, ChainBridgeBSC.address)

    await TokenRINInterface.transfer(acc1.address, 1000000000000000)
    await TokenBSCInterface.transfer(acc1.address, 1000000000000000)

    TokenRINaddress = TokenRINInterface.address;
    TokenBSCaddress = TokenBSCInterface.address;

    await ChainBridgeRIN.updateERC20ById(1337, TokenRINaddress, true);
    await ChainBridgeRIN.updateERC20ById(1337, TokenBSCaddress, true);
    await ChainBridgeBSC.updateERC20ById(1337, TokenRINaddress, true);
    await ChainBridgeBSC.updateERC20ById(1337, TokenBSCaddress, true);
  });

  describe("Getter public functions", function() {
    it("Should return TRUE to valid chain ID and ERC20 address", async function() {
      expect(await ChainBridgeRIN.isERC20valid(1337, TokenBSCaddress)).to.equal(true)
      expect(await ChainBridgeBSC.isERC20valid(1337, TokenRINaddress)).to.equal(true)
    })

    it("Should return validator address", async function() {
      expect(await ChainBridgeRIN.validator()).to.equal(owner.address)
      expect(await ChainBridgeBSC.validator()).to.equal(owner.address)
      })
  })

  describe("swap function", function() {
    it("Bridge id and erc20 address must be valid", async function() {
      expect(ChainBridgeRIN.swap(acc1.address, 100000000, 1337, TokenRINaddress , 1, "0x0000000000000000000000000000000000000000")).to.be.revertedWith("Chain id or ERC20 address to is not valid")
      expect(ChainBridgeBSC.swap(acc1.address, 100000000, 1, "0x0000000000000000000000000000000000000000", 1337, TokenRINaddress)).to.be.revertedWith("Chain id or ERC20 address from is not valid")
    })

    it("Account can swap his avalibale tokens to the ChainBridge and emit SwapInitialized", async function() {
        const swapping = await ChainBridgeRIN.connect(acc1).swap(acc2.address, 100000000000000, 1337, TokenRINaddress, 1337, TokenBSCaddress)
        expect(swapping).to.emit(ChainBridgeRIN, "SwapInitialized").withArgs(acc1.address, acc2.address, "100000000000000", "1337", TokenRINaddress, "1337", TokenBSCaddress)
        expect(await TokenRINInterface.balanceOf(acc1.address)).to.be.equal(`${1000000000000000 - 100000000000000}`)
      })
  })

  describe("setNewValidator function", function() {
    it("With ADMIN_ROLE accounts only can set new validator", async function() {
      expect(ChainBridgeRIN.connect(acc1).setNewValidator("0x0000000000000000000000000000000000000000")).to.be.revertedWith("You dont have ADMIN rights")
      expect(ChainBridgeBSC.connect(acc1).setNewValidator("0x0000000000000000000000000000000000000000")).to.be.revertedWith("You dont have ADMIN rights")
    })

    it("Account with ADMIN_ROLE rights can set new validator", async function() {
      await ChainBridgeRIN.connect(owner).setNewValidator("0x0000000000000000000000000000000000000000")
      await ChainBridgeBSC.connect(owner).setNewValidator("0x0000000000000000000000000000000000000000")
      expect(await ChainBridgeRIN.validator()).to.be.equal("0x0000000000000000000000000000000000000000")
      expect(await ChainBridgeBSC.validator()).to.be.equal("0x0000000000000000000000000000000000000000")
    })
  })

  describe("updateERC20ById function", function() {
    it("With ADMIN_ROLE accounts only can update ERC20 addresses on chains", async function() {
      expect(ChainBridgeRIN.connect(acc1).updateERC20ById(1337, acc1.address, true)).to.be.revertedWith("You dont have ADMIN rights")
      expect(ChainBridgeBSC.connect(acc1).updateERC20ById(1337, acc1.address, true)).to.be.revertedWith("You dont have ADMIN rights")
    })

    it("Account with ADMIN_ROLE rights can update ERC20 addresses on chains", async function() {
      await ChainBridgeRIN.connect(owner).updateERC20ById(1337, acc1.address, true)
      await ChainBridgeBSC.connect(owner).updateERC20ById(1337, acc1.address, true)
      expect(await ChainBridgeRIN.isERC20valid(1337, acc1.address)).to.be.equal(true)
      expect(await ChainBridgeBSC.isERC20valid(1337, acc1.address)).to.be.equal(true)
    })
  })

  describe("giveAdminRights function", function() {
    it("Only account can give ADMIN_ROLE to another", async function() {
      expect(ChainBridgeRIN.connect(acc1).giveAdminRights(acc1.address)).to.be.revertedWith("You dont have ADMIN rights")
    })

    it("Account with rights can give ADMIN_ROLE to another", async function() {
      await ChainBridgeRIN.connect(owner).giveAdminRights(acc1.address)
      expect(await ChainBridgeRIN.hasRole("0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", acc1.address)).to.be.equal(true)
    })
  })

  describe("revokeAdminRights function", function() {
    it("Only account can revoke ADMIN_ROLE to another", async function() {
      expect(ChainBridgeRIN.connect(acc1).revokeAdminRights(acc1.address)).to.be.revertedWith("You dont have ADMIN rights")
    })

    it("account can revoke ADMIN_ROLE from another", async function() {
      await ChainBridgeRIN.connect(owner).giveAdminRights(acc1.address)
      expect(await ChainBridgeRIN.hasRole("0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", acc1.address)).to.be.equal(true)
      await ChainBridgeRIN.connect(owner).revokeAdminRights(acc1.address)
      expect(await ChainBridgeRIN.hasRole("0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775", acc1.address)).to.be.equal(false)
    })
  }) 

  describe("redeem function", function() {
    beforeEach(async function() {
      ///@dev before redeem, swap must be initialized to get event SwapInitialized
      let swapping = await ChainBridgeRIN.connect(acc1).swap(acc2.address, 100000000000000, 1337, TokenRINaddress, 1337, TokenBSCaddress)
      swapping = await swapping.wait()
      ///@dev getting event array from swap function to input it values to redeem function
      SwapInitialized = swapping.events[1].args
    })

    it("chainIdfrom and erc20from address must be valid", async function() {
      let msg = ethers.utils.solidityKeccak256(
        ["address", "uint256", "uint256", "address"],
        [SwapInitialized[1], ethers.utils.formatUnits(SwapInitialized[2], 0), SwapInitialized[3], acc1.address]
      )

      let signature = await acc1.signMessage(ethers.utils.arrayify(msg))
      let sig = ethers.utils.splitSignature(signature)

      expect(ChainBridgeRIN.connect(acc1).redeem(
        SwapInitialized[1],
        ethers.utils.formatUnits(SwapInitialized[2], 0),
        ethers.utils.formatUnits(SwapInitialized[3], 0),
        acc1.address,
        SwapInitialized[6],
        sig.v, sig.r, sig.s
        )
      ).to.be.revertedWith("Chain id or ERC20 address from is not valid")
    })

    it("CheckSign function must return 'true' to require redeem function", async function() {
      let msg = ethers.utils.solidityKeccak256(["address", "uint256"], [SwapInitialized[1], ethers.utils.formatUnits(SwapInitialized[2], 0)])
      let signature = await acc1.signMessage(ethers.utils.arrayify(msg))
      let sig = ethers.utils.splitSignature(signature)

      expect(ChainBridgeRIN.connect(acc1).redeem(
        SwapInitialized[1],
        ethers.utils.formatUnits(SwapInitialized[2], 0),
        ethers.utils.formatUnits(SwapInitialized[3], 0),
        SwapInitialized[4],
        SwapInitialized[6],
        sig.v, sig.r, sig.s
        )
      ).to.be.revertedWith("Input is not valid")
    })

    it("If signature is valid, function redeem will mint tokens to recepient", async function() {
      let msg = ethers.utils.solidityKeccak256(
        ["address", "uint256", "uint256", "address"],
        [SwapInitialized[1], ethers.utils.formatUnits(SwapInitialized[2], 0), SwapInitialized[3], SwapInitialized[4]]
      )

      let signature = await owner.signMessage(ethers.utils.arrayify(msg))
      let sig = ethers.utils.splitSignature(signature)
      ///@dev initializing redeem function with validator signature
      let redeeming = await ChainBridgeBSC.connect(acc1).redeem(
        SwapInitialized[1],
        ethers.utils.formatUnits(SwapInitialized[2], 0),
        ethers.utils.formatUnits(SwapInitialized[3], 0),
        SwapInitialized[4],
        SwapInitialized[6],
        sig.v, sig.r, sig.s
        )
      await redeeming.wait()
      ///@dev expect to mint tokens on TokenBSCInterface contract to acc2
      expect(await TokenBSCInterface.balanceOf(acc2.address)).to.be.equal(`${(ethers.utils.formatUnits(SwapInitialized[2], 0))}`)
    })

    it("Account cant use same singature to redeem twice", async function() {
      let msg = ethers.utils.solidityKeccak256(
        ["address", "uint256", "uint256", "address"],
        [SwapInitialized[1], ethers.utils.formatUnits(SwapInitialized[2], 0), SwapInitialized[3], SwapInitialized[4]]
      )

      let signature = await owner.signMessage(ethers.utils.arrayify(msg))
      let sig = ethers.utils.splitSignature(signature)
      ///@dev initializing redeem function with validator signature
      let redeeming = await ChainBridgeBSC.connect(acc1).redeem(
        SwapInitialized[1],
        ethers.utils.formatUnits(SwapInitialized[2], 0),
        ethers.utils.formatUnits(SwapInitialized[3], 0),
        SwapInitialized[4],
        SwapInitialized[6],
        sig.v, sig.r, sig.s
        )
      await redeeming.wait()

      expect(ChainBridgeBSC.connect(acc1).redeem(
        SwapInitialized[1],
        ethers.utils.formatUnits(SwapInitialized[2], 0),
        ethers.utils.formatUnits(SwapInitialized[3], 0),
        SwapInitialized[4],
        SwapInitialized[6],
        sig.v, sig.r, sig.s
        )).to.be.revertedWith("Hash is not valid")
    })
  })
})