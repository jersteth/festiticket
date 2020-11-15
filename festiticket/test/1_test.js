const FestivalShop = artifacts.require("FestivalShop");
const CurrencyToken = artifacts.require("CurrencyToken");
const FestiTicket = artifacts.require("FestiTicket");
var currencyTokenInstance, festiTicketInstance, shopInstance;

contract("FestiTicket", async accounts => {
  it ("Purchase new ticket", async () => {
    currencyTokenInstance = await CurrencyToken.deployed();
    festiTicketInstance = await FestiTicket.deployed();
    shopInstance = await FestivalShop.deployed();

    let shopAddress = shopInstance.address;

    let address1 = web3.utils.toChecksumAddress(accounts[1])
    await currencyTokenInstance.transfer(address1,50000);
    let balance1 = parseInt(await currencyTokenInstance.balanceOf(address1));
    console.log("Balance account1 before test: "+balance1);

    let address2 = web3.utils.toChecksumAddress(accounts[2])
    await currencyTokenInstance.transfer(address2,30000);

    let initialShopBalance = parseInt(await currencyTokenInstance.balanceOf(shopAddress));
    console.log("Shop balance before test: "+initialShopBalance);

    let initialTicketPrice = parseInt(await festiTicketInstance.getOriginalPrice());
    console.log ("Initial ticket price: "+initialTicketPrice);

    console.log("Approving FestivalShop for spending "+initialTicketPrice+" XCUR");
    await currencyTokenInstance.approve(shopInstance.address, initialTicketPrice, {from: accounts[1]});

    await shopInstance.buyTicket({from: address1});
    assert.equal(1, await festiTicketInstance.getTicketTotal(), "Expected one sold ticket");
    assert.equal(1, await festiTicketInstance.balanceOf(address1), "Expectect 1 ticket in account1 possesion");

    let newBalance1 = parseInt(await currencyTokenInstance.balanceOf(address1));
    let newShopBalance = parseInt(await currencyTokenInstance.balanceOf(shopAddress));
    console.log("New balance1: "+newBalance1);
    console.log("New shop balance: "+newShopBalance);
    assert.equal(initialShopBalance + initialTicketPrice, newShopBalance, "Expected shop to have received balance for ticket");
    assert.equal(balance1 - initialTicketPrice, newBalance1, "Expected new balance from account1 does not match");
    try {
      await shopInstance.buyTicket({from: address1});
      assert.fail("No purchase allowance given to shop for ticket - should fail.")
    } catch (e) {
    }
    console.log("Approving FestivalShop for spending again "+initialTicketPrice+" XCUR");
    await currencyTokenInstance.approve(shopInstance.address,initialTicketPrice, {from: accounts[1]});
    await shopInstance.buyTicketFor(address2, {from: address1});
    assert.equal(2, await festiTicketInstance.getTicketTotal(), "Expected two sold tickets");
    assert.equal(1, await festiTicketInstance.balanceOf(address1), "Expectect 1 ticket in account1 possesion");
    assert.equal(1, await festiTicketInstance.balanceOf(address2), "Expectect 1 ticket in account2 possesion");
    newBalance1 = parseInt(await currencyTokenInstance.balanceOf(address1));
    newShopBalance = parseInt(await currencyTokenInstance.balanceOf(shopAddress));
    console.log("New balance1: "+newBalance1);
    console.log("New shop balance: "+newShopBalance);
    assert.equal(initialShopBalance + 2 * initialTicketPrice, newShopBalance, "Expected shop to have extra received balance for ticket");
    assert.equal(balance1 - 2 * initialTicketPrice, newBalance1, "Expected new balance from account1 does not match");

  });

  it ("Offer ticket for sale", async () => {
    currencyTokenInstance = await CurrencyToken.deployed();
    festiTicketInstance = await FestiTicket.deployed();
    shopInstance = await FestivalShop.deployed();
    let initialTicketPrice = parseInt(await festiTicketInstance.getOriginalPrice());
    let address1 = web3.utils.toChecksumAddress(accounts[1]);
    let address2 = web3.utils.toChecksumAddress(accounts[2]);
    console.log("balance 0:"+ await web3.eth.getBalance(accounts[0]));
    console.log("balance 1:"+ await web3.eth.getBalance(accounts[1]));
    console.log("balance 2:"+ await web3.eth.getBalance(accounts[2]));
    let shopAddress = shopInstance.address;
    await currencyTokenInstance.approve(shopInstance.address, initialTicketPrice, {from: accounts[1]});
    await shopInstance.buyTicket({from: address1});
    let ticketCount1 = parseInt(await festiTicketInstance.balanceOf(address1));
    let ticketCount2 = parseInt(await festiTicketInstance.balanceOf(address2));

    let shopBalance = parseInt(await currencyTokenInstance.balanceOf(shopAddress));
    console.log("Shop balance before test: "+shopBalance);

    let balance1 = parseInt(await currencyTokenInstance.balanceOf(address1));
    console.log("Balance account1 before test: "+balance1);
    let balance2 = parseInt(await currencyTokenInstance.balanceOf(address2));
    console.log("Balance account2 before test: "+balance2);

    let tokenId = await festiTicketInstance.tokenOfOwnerByIndex(address1, 0);
    console.log("Token id "+tokenId);
    console.log("Authorizing the store to sell the ticket on behalf of account1.");
    await festiTicketInstance.approve(shopInstance.address, tokenId, {from: accounts[1]});
    console.log("Offering ticket for resale in the shop for 105% original price");
    let resaleTicketPrice = initialTicketPrice * 105 / 100;
    await shopInstance.offerTicket(tokenId, resaleTicketPrice, {from: accounts[1]});

    console.log("Account 2 - Authorizing purchase");
    await currencyTokenInstance.approve(shopInstance.address, resaleTicketPrice, {from: accounts[2]});
    console.log("Account 2 - Purchasing offered ticket");
    await shopInstance.buyOfferedTicket(tokenId, {from: accounts[2]});

    let newShopBalance = parseInt(await currencyTokenInstance.balanceOf(shopAddress));
    console.log("Shop balance after test: "+newShopBalance);
    let newBalance1 = parseInt(await currencyTokenInstance.balanceOf(address1));
    console.log("Balance account1 after test: "+newBalance1);
    let newBalance2 = parseInt(await currencyTokenInstance.balanceOf(address2));
    console.log("Balance account2 after test: "+newBalance2);
    let commission = resaleTicketPrice * 1 / 100;
    assert.equal(shopBalance + commission, newShopBalance, "Expected shop to have extra received commission for ticket");
    assert.equal(balance1 + resaleTicketPrice - commission, newBalance1, "Expected new balance from account1 does not match");
    assert.equal(balance2 - resaleTicketPrice, newBalance2, "Expected new balance from 2 does not match");
    assert.equal(ticketCount1 - 1, await festiTicketInstance.balanceOf(address1), "Expected ticket count account1 is wrong");
    assert.equal(ticketCount2 + 1, await festiTicketInstance.balanceOf(address2), "Expected ticket count account2 is wrong");

    // Attempt to offer for sale for more than 110% last price.
    await festiTicketInstance.approve(shopInstance.address, tokenId, {from: accounts[2]});
    console.log("Offering ticket for resale in the shop for 111% last price - should fail");
    try {
      await shopInstance.offerTicket(tokenId, resaleTicketPrice*111/100, {from: accounts[2]});
      assert.fail(" - should fail.")
    } catch (e) {
    }
    // Attempt to offer for sale for more than 110% last price.
    console.log("Offering ticket for resale in the shop which you do not own - should fail.");
    try {
      await festiTicketInstance.approve(shopInstance.address, tokenId, {from: accounts[1]});
      await shopInstance.offerTicket(tokenId, resaleTicketPrice*105/100, {from: accounts[1]});
      assert.fail(" - should fail.")
    } catch (e) {
    }


  });
});
