const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying mockERC20');
    const Token = await ethers.getContractFactory('TOKEN');
    const token = await Token.deploy("Charles", "CT", deployer.address); // putting constructor arguments within deploy
    console.log(`Token address: ${token.address} `);
    console.log('Deploying wrappedToken')
    const wToken = await ethers.getContractFactory('wToken');
    const wtoken = await wToken.deploy(token.address);
    console.log(`wToken address: ${wtoken.address}`);

}



main().then( () => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    })