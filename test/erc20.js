const { expect } = require('chai');
const { ethers } = require('hardhat');

let TOKEN, token, owner, addr1, TokenMockFactory, TokenMockDeployed, WrappedTokenFactory, WrappedTokenDeployed;

    describe('Token contract', () => {

        beforeEach(async () => {
            [owner, addr1, _] = await ethers.getSigners(); // get the signers 
            TokenMockFactory = await ethers.getContractFactory('TOKEN'); // cache the contract
            TokenMockDeployed = await TokenMockFactory.deploy("Charles", "CT", owner.address); // deploy the mock
            await TokenMockDeployed.mint(owner.address, 500) // mint
            WrappedTokenFactory = await ethers.getContractFactory('wToken');
            WrappedTokenDeployed= await WrappedTokenFactory.deploy(TokenMockDeployed.address);
        });

    describe("Deployment", () => {
        it("Should set the right boss", async() => {
            expect(await WrappedTokenDeployed.boss()).to.equal(owner.address)
        })
        it("Should set the correct name", async() =>{
            expect(await WrappedTokenDeployed.name()).to.equal("wToken");
        })
        it("Should set the correct symbol", async() => {
            expect(await WrappedTokenDeployed.symbol()).to.equal("WT");
        })
        it("Should set the correct ERC", async() =>{
            expect(await WrappedTokenDeployed.erc()).to.equal(TokenMockDeployed.address);
        })
        })

    describe("mint function", () =>{
        it("Should revert if not the boss calls the function", async() => {
            await expect(WrappedTokenDeployed.connect(addr1).mint(addr1.address, 100)).to.be.revertedWith("Not allowed to call mint");
        })
        it("Should mint the correct amount", async() =>{
            await WrappedTokenDeployed.mint(owner.address, 200);
            expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(200);
        })
        it("Should adjust the totalSupply", async() => {
            await WrappedTokenDeployed.mint(owner.address, 200);
            expect(await WrappedTokenDeployed.totalSupply()).to.equal(200)
        })
    })
    describe("Transfer function", async() => {
        it("Should adjust both balances", async() =>{
            await WrappedTokenDeployed.mint(owner.address, 200);
            await WrappedTokenDeployed.transfer(addr1.address, 200);
            expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(0);
            expect(await WrappedTokenDeployed.balanceOf(addr1.address)).to.equal(200);
        })
        it("Should revert if a user tries to transfer more than his balance", async() =>{
            await WrappedTokenDeployed.mint(owner.address, 200);
            await expect(WrappedTokenDeployed.transfer(addr1.address, 300)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        })
    })
    describe("TransferFrom function", async() =>{
        it("Should revert if no allowance exists", async() =>{
            await WrappedTokenDeployed.mint(addr1.address, 200);
            await expect(WrappedTokenDeployed.transferFrom(addr1.address, owner.address, 200)).to.be.revertedWith("ERC20: insufficient allowance")
        })
        it("Should adjust amounts correct", async() => {
            await WrappedTokenDeployed.mint(owner.address, 5000);
            await WrappedTokenDeployed.approve(addr1.address, 5000);
            await WrappedTokenDeployed.connect(addr1).transferFrom(owner.address, addr1.address, 200);
            expect(await WrappedTokenDeployed.balanceOf(addr1.address)).to.equal(200);
            expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(5000-200)
        })
    })
    describe("Allowance tests",() =>{
        it("Should adjust the allowance correct", async() =>{
            await WrappedTokenDeployed.approve(addr1.address, 100)
            expect (await WrappedTokenDeployed.allowance(owner.address, addr1.address)).to.equal(100);
        })
    })
    describe("Deposits", () =>{

       it("Should revert if no approval is given", async() =>{
            await expect(WrappedTokenDeployed.deposit(100)).to.be.revertedWith("ERC20: insufficient allowance")
       }) 
       it("Should increase balance and totalSupply", async() =>{
           await TokenMockDeployed.approve(WrappedTokenDeployed.address, 100)
           expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(0);
           expect(await WrappedTokenDeployed.totalSupply()).to.equal(0);
           await WrappedTokenDeployed.deposit(100)
           expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(100);
           expect(await WrappedTokenDeployed.totalSupply()).to.equal(100);
           expect(await TokenMockDeployed.balanceOf(WrappedTokenDeployed.address)).to.equal(100);
           expect(await TokenMockDeployed.balanceOf(owner.address)).to.equal(500-100);
       })
    })
    describe("Withdraw", () =>{
        it("Should revert if the user has no balance",async() =>{
             await expect(WrappedTokenDeployed.withdraw(100)).to.be.revertedWith("You dont have enough tokens")
        })
        it("Should transfer tokens back and decrease amount", async() =>{
            await TokenMockDeployed.approve(WrappedTokenDeployed.address, 100)
           expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(0);
           expect(await WrappedTokenDeployed.totalSupply()).to.equal(0);
           await WrappedTokenDeployed.deposit(100)
           expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(100);
           expect(await WrappedTokenDeployed.totalSupply()).to.equal(100);
           expect(await TokenMockDeployed.balanceOf(WrappedTokenDeployed.address)).to.equal(100);
           expect(await TokenMockDeployed.balanceOf(owner.address)).to.equal(500-100);
           // now withdraw
           await WrappedTokenDeployed.withdraw(100);
           expect(await WrappedTokenDeployed.balanceOf(owner.address)).to.equal(0);
           expect(await WrappedTokenDeployed.totalSupply()).to.equal(0);
           expect(await TokenMockDeployed.balanceOf(owner.address)).to.equal(500);
           expect(await TokenMockDeployed.balanceOf(WrappedTokenDeployed.address)).to.equal(0);

        })
    })
})

