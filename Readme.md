FestiTicket
---
Festival Tickets as NFT's, buyable with a currency token implementation.
Secondary market where tickets can be resold for max 110% of previous price and where the
shop takes a 1% commission.

Overview of implementation
----------
For this exercise I use:
* Ethereum with ganache-cli.
* Truffle suite is used for compile, deploy and some unit testing.
* Lighttpd for the frontend.
* Metamask and Chrome for the UI running with some basic javascript and jQuery.
All services run in docker containers.

There are three Smart contracts, FestivalShop represents the shop. Then there is one for the currency token and one for the NFT token.
* There is an ERC20 token called XCUR (2 decimals) which represents the currency token.
* There is an ERC721 (NFT) token FestiTicket which represent festival tickets.
* I use openzeppelin as the base layer for the tokens and Access Control.
* FestivalTickets can only be sold by entities having the TRANSFER_ROLE, which is only the shop. This is to prevent circumventing the secondary market of FestivalShop.
* The FestivalShop takes a 1% commission on a all resales.
* Bought tickets can be offered for resale to the secondary market of the shop for a requested price.
* When tickets are for sale they can be bought by anyone.

Limitations/Good to know:
* Basic UI to demonstrate the functioning smart contracts. No layouting, ugly popups,...
* Not many error conditions have been implemented in UI.
* Fixed 3 accounts in Ganache to preventing reimporting in Metamask. See docker-compose.yaml to add more.
* abi's from truffle are copied to the dapp in make_abi.sh at the end of truffle commands.
* The URI's of the NFT's have not been used. In the ideal world, they point to a QR code
in which ticket Id and owner address are both stored. To validate entry at the festival
there would be a proof of ownership of the owner address required.


Folder structure:
* festiticket: truffle suite, smartcontract
* festiticket-dapp: UI
* ganache_data: state from ganache.

How to run
----------

Make sure you have a running Docker environment configured.
Also make sure you have chrome with the Metamask extension installed.

```
git clone git@github.com/jeroenost/festiticket
cd festiticket
docker-compose build
docker-compose up
```

After a couple of minutes, ganache is up and running and contracts are deployed.
Find out the ip address of your docker host. Depending on the type of docker this can be your public ip, 127.0.0.1 or for docker-machine on OSX something like 192.168.99.100. See docker documentation on how to determine this ip.

Next, configure Metamask. If your docker host is localhost/127.0.0.1:
* Click on the Metamask icon in chrome to bring up Metamask
* Click on Localhost 8545
* If connection fails, click on the top right metamask icon, settings, networks, select 'Localhost 8545' and edit the field Chain Id to 4447.

If your docker host is different from localhost/127.0.0.1:
* Click on the currently selected network ("Ethereum mainnet") and then on "Custom RPC"
* For Network name: enter 'ganache'
* For New RPC URL enter http://\<ip\>:8545 where ip is the ip address of your docker host.
* For chainId enter 4447
* Click save

For the test network, we work with three fixed accounts. Account0 is used for deployment by truffle and is not needed in Metamask.
Account1 and account2 will be imported. Use Private key 1 from Ganache-cli output log for account 1 and Private Key 2 for account 2
Next, import two ethereum accounts in Metamask:
* Click on the top right icon in Metamask
* In the Pulldown click on Import account
* Paste the private key.
* Click on the three dots, Account details
* Rename the account to "FestiTicket 1" and "FestiTicket 2" respectively.

As a final step, connect chrome to http://\<ip\>:8080 where \<ip\> is again the ip address of your docker host.
Connect Metamask will popup. Allow access to both accounts.

Using the FestiTicket Dashboard
-----------
Initially every account has some XCUR balance which can be used to buy tickets.
With the buttons you can buy a new ticket from the shop. This will require you to sign
two Metamask transactions.

When buying a ticket, the first one is to approve the spending of an XCUR balance and the
second one is to approve the purchase.

When offering a ticket for resale, you first authorise the Shop to transfer the NFT on your
behalf, and then in the second transaction you request to offer it on the market.

When buying 2nd hand, you first approve the spending of the appropriate amount of XCUR and
then you do the actual purchase to the shop.

You can buy for yourself or for another account holder with the buttons to buy for someone else.

The dashboard shows the current state and ownership of tickets, balances of the shop and status of the current account (in Metamask).

To switch to another user, click on Metamask top right icon and select the other account. This way you can purchase tickets from both accounts, or purchase tickets for another account. 
