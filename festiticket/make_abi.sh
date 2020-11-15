mkdir -p abi
echo "var abiCurrencyToken = " $(cat build/contracts/CurrencyToken.json | jq .abi) ";" > dapp/abiCurrencyToken.js
echo "var currencyTokenAddress = " $(cat build/contracts/CurrencyToken.json | jq .networks[].address) ";" >> dapp/abiCurrencyToken.js
echo "var abiFestivalShop = " $(cat build/contracts/FestivalShop.json | jq .abi) ";"> dapp/abiFestivalShop.js
echo "var festivalShopAddress = " $(cat build/contracts/FestivalShop.json | jq .networks[].address) ";" >> dapp/abiFestivalShop.js
echo "var abiFestiTicket = " $(cat build/contracts/FestiTicket.json | jq .abi) ";"> dapp/abiFestiTicket.js
echo "var festiTicketAddress = " $(cat build/contracts/FestiTicket.json | jq .networks[].address) ";" >> dapp/abiFestiTicket.js
