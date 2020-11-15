const FestivalShop = artifacts.require("FestivalShop");
const CurrencyToken = artifacts.require("CurrencyToken");
const FestiTicket = artifacts.require("FestiTicket");
var currencyTokenInstance, festiTicketInstance, shopInstance;
const InitialTicketPrice = 10000; //100.00 XCUR initial price
const MaxTicketCount = 1000;

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(CurrencyToken);
  currencyTokenInstance = await CurrencyToken.deployed();
  await deployer.deploy(FestiTicket, currencyTokenInstance.address, InitialTicketPrice, MaxTicketCount);
  festiTicketInstance = await FestiTicket.deployed();
  await deployer.deploy(FestivalShop, currencyTokenInstance.address, festiTicketInstance.address);
  shopInstance = await FestivalShop.deployed();
  // Grant the MINTER_ROLE to the shop.
  let minter_role = await festiTicketInstance.MINTER_ROLE();
  await festiTicketInstance.grantRole(minter_role, shopInstance.address);
  // Only the shop can transfer tickets to prevent direct transfers without monetization.
  let transfer_role = await festiTicketInstance.TRANSFER_ROLE();
  await festiTicketInstance.grantRole(transfer_role, shopInstance.address);

  let address1 = web3.utils.toChecksumAddress(accounts[1])
  await currencyTokenInstance.transfer(address1,50000);

  let balance1 = parseInt(await currencyTokenInstance.balanceOf(address1));
  console.log("XCUR Balance account1 "+address1+" after deploy "+balance1);

  let address2 = web3.utils.toChecksumAddress(accounts[2])
  await currencyTokenInstance.transfer(address2,50000);
  let balance2 = parseInt(await currencyTokenInstance.balanceOf(address2));
  console.log("XCUR Balance account2 "+address2+" after deploy "+balance2);

};
