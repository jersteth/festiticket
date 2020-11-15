var web3 = new Web3(web3.currentProvider);
var shop, xcur, ticket;
var myAccount;
var origTicketPrice;
var xcurDecimals;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      console.log("Initializing abi shop at "+festivalShopAddress);
      shop = new web3.eth.Contract(abiFestivalShop,festivalShopAddress, { from: accounts[0]});
      console.log("Initializing abi xcur at "+currencyTokenAddress);
      xcur = new web3.eth.Contract(abiCurrencyToken,currencyTokenAddress, { from: accounts[0]});
      console.log("Initializing abi ticket at "+festiTicketAddress);
      ticket = new web3.eth.Contract(abiFestiTicket,festiTicketAddress, { from: accounts[0]});
      xcur.methods.decimals().call().then(function(decimals) {
          xcurDecimals = decimals;
          console.log("XCUR uses "+decimals+" decimals");
          myAccount = web3.eth.getAccounts().then(function(accounts) {
            myAccount=accounts[0];
            console.log("My account: "+myAccount);
            getData();
          });
        });
    });
    $("#buy_button").click(buy);
    $("#offer_button").click(offer);
    $("#buy_offered_button").click(buy_offered);
});

function prettyBalance(arg) {
  return (parseInt(arg) /  (10**xcurDecimals) ).toFixed(xcurDecimals) + " XCUR";
}
async function getData() {
  console.log("Getting balance of shop "+festivalShopAddress);

  xcur.methods.balanceOf(festivalShopAddress).call().then(function(res) {
    console.log(res);
    var amount = prettyBalance(res);
    console.log("Current contract balance: "+amount);
    $("#shopBalance").text(amount);
  });
  console.log("Getting balance of my account "+myAccount);
  xcur.methods.balanceOf(myAccount).call().then(function(res) {
    console.log(res);

    var amount = prettyBalance(res);
    console.log("myAccount balance: "+res);
    $("#accxcur").text(amount);
  });
  console.log("Getting original ticket price");
  shop.methods.getOriginalPrice().call().then(function(res) {
    console.log(res);
    origTicketPrice = res;
    var amount = prettyBalance(res);
    console.log("original ticket price: "+res);
    $("#ticketPrice").text(amount);
  });

  shop.methods.getTicketsSold().call().then(function(ticketIds) {
    console.log("Tickets sold:" + JSON.stringify(ticketIds));
    $("#ticketCount").text(ticketIds.length);

    $("#ticketInfo").text(ticketIds.join());
    $("#forsaleinfo").remove();
    $("#resaleTicketInfo").after(function(){ return '<div id="forsaleinfo"/>'});
    ticketIds.forEach(function(ticketId) {
      shop.methods.getForSalePrice(ticketId).call().then(function(price) {
        var t="Ticket "+ticketId+" "+(price>0?" is for sale for "+prettyBalance(price):" is not for resale");
        shop.methods.getLastSellPrice(ticketId).call().then(function(sellPrice) {
          t=t+(". Last sold for "+prettyBalance(sellPrice));
          console.log(t);
          $("#forsaleinfo").after(function(){ return '<div id="#forsale">'+t+'</div>'});

        });
      });
    });
  });

  ticket.methods.balanceOf(myAccount).call().then(function(amount) {
      console.log("Account owns "+amount+" tickets");
      $("#yourticketinfo").remove();
      $("#yourtickets").after(function(){ return '<div id="yourticketinfo"/>'});
      if (amount==0) {
        $("#yourticketinfo").after(function(){ return '<div>No tickets</div>'});
      } else {
        for (i=0; i< amount; i++) {
          ticket.methods.tokenOfOwnerByIndex(myAccount,i).call().then(function(ticketId) {
            $("#yourticketinfo").after(function(){ return '<div id="#forsale">Ticket '+ticketId+'</div>'});
          });
        }
      }
  });


}
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
async function buy() {
  console.log("Buying from account "+myAccount);

  web3.eth.getBalance(myAccount, (err, balance) => {
    console.log("Eth balance: "+balance);
  });

  const approveTx = {
    from: myAccount,
    to: currencyTokenAddress,
    gas: web3.utils.toHex(3000000),
    data: xcur.methods.approve(festivalShopAddress, origTicketPrice).encodeABI()
  };
  web3.eth.sendTransaction(approveTx, async function(err, transactonHash) {
    console.log("Submitted transaction with hash: ", transactonHash);
    let transactionReceipt = null
    while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
        transactionReceipt = await web3.eth.getTransactionReceipt(transactonHash);
        await sleep(1000);
    }
    console.log("Got the transaction receipt: ", transactionReceipt);
    const buyTx = {
      from: myAccount,
      to: festivalShopAddress,
      gas: web3.utils.toHex(3000000),
      data: shop.methods.buyTicket().encodeABI()
    }
    web3.eth.sendTransaction(buyTx, async function(err, transactonHash) {
      console.log("Submitted transaction with hash: ", transactonHash);
      let transactionReceipt = null
      while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
          transactionReceipt = await web3.eth.getTransactionReceipt(transactonHash);
          await sleep(1000);
      }
      console.log("Got the transaction receipt: ", transactionReceipt);
      getData();
    });
  });
}

async function offer() {
  var tokenId = prompt("Token id to sell:");
  var price = (10**xcurDecimals) * prompt("Price to sell for:");
  console.log("Offering ticket "+tokenId+" from account "+myAccount+" for a price of "+prettyBalance(price));

  const approveTx = {
    from: myAccount,
    to: festiTicketAddress,
    gas: web3.utils.toHex(3000000),
    data: ticket.methods.approve(festivalShopAddress, tokenId).encodeABI()
  };
  web3.eth.sendTransaction(approveTx, async function(err, transactonHash) {
    console.log("Submitted transaction with hash: ", transactonHash);
    let transactionReceipt = null
    while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
        transactionReceipt = await web3.eth.getTransactionReceipt(transactonHash);
        await sleep(1000);
    }
    console.log("Got the transaction receipt: ", transactionReceipt);
    const buyTx = {
      from: myAccount,
      to: festivalShopAddress,
      gas: web3.utils.toHex(3000000),
      data: shop.methods.offerTicket(tokenId, price).encodeABI()
    }
    web3.eth.sendTransaction(buyTx, async function(err, transactonHash) {
      console.log("Submitted transaction with hash: ", transactonHash);
      let transactionReceipt = null
      while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
          transactionReceipt = await web3.eth.getTransactionReceipt(transactonHash);
          await sleep(1000);
      }
      console.log("Got the transaction receipt: ", transactionReceipt);
      getData();
    });
  });
}

async function buy_offered() {
  var tokenId = prompt("Token id to buy:");

  shop.methods.getForSalePrice(tokenId).call().then(function(price) {
    if (price == 0) {
      alert("Ticket "+tokenId+" is not for sale!");
      return;
    }
    console.log("Ticket "+tokenId+" was for sale for "+prettyBalance(price));
    const approveTx = {
      from: myAccount,
      to: currencyTokenAddress,
      gas: web3.utils.toHex(3000000),
      data: xcur.methods.approve(festivalShopAddress, price).encodeABI()
    };
    web3.eth.sendTransaction(approveTx, async function(err, transactonHash) {
      console.log("Submitted transaction with hash: ", transactonHash);
      let transactionReceipt = null
      while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
          transactionReceipt = await web3.eth.getTransactionReceipt(transactonHash);
          await sleep(1000);
      }
      console.log("Got the transaction receipt: ", transactionReceipt);
      const buyTx = {
        from: myAccount,
        to: festivalShopAddress,
        gas: web3.utils.toHex(3000000),
        data: shop.methods.buyOfferedTicket(tokenId).encodeABI()
      }
      web3.eth.sendTransaction(buyTx, async function(err, transactonHash) {
        console.log("Submitted transaction with hash: ", transactonHash);
        let transactionReceipt = null
        while (transactionReceipt == null) { // Waiting expectedBlockTime until the transaction is mined
            transactionReceipt = await web3.eth.getTransactionReceipt(transactonHash);
            await sleep(1000);
        }
        console.log("Got the transaction receipt: ", transactionReceipt);
        getData();
      });
    });

  });


}
