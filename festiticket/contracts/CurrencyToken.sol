pragma solidity ^0.6.2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CurrencyToken is ERC20 {
    constructor() public ERC20("XCurrency", "XCur") {
        _mint(msg.sender, 1000000);
    }
}
