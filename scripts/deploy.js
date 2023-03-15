const { ethers } = require('hardhat');
const { writeFileSync } = require('fs');

async function deploy(name, ...params) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then(f => f.deployed());
}

async function main() {
  const invyfi = await deploy('InvyFi', "0xb3db178db835b4dfcb4149b2161644058393267d");
  console.log("InvyFy deployed to:", invyfi.address);

  writeFileSync('output.json', JSON.stringify({
    InvyFi: invyfi.address,
    PLI: "0xb3db178db835b4dfcb4149b2161644058393267d",
    USPLUS: "0x098db963654868ab3df79be0974cf97a6e8054bd",
    CGO: "0xc58dd5c23a4dca5232557e36fd1a57896ffd40e4"
  }, null, 2));

}
if (require.main === module) {
  main().then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
}