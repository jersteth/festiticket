pragma solidity ^0.6.2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./CurrencyToken.sol";

contract FestiTicket is ERC721, AccessControl {
    using Counters for Counters.Counter;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");

    Counters.Counter private _tokenIdTracker;
    uint32 private _maxAmount;
    CurrencyToken private _currencyToken;
    uint256 private _initialPrice;

    constructor(CurrencyToken currencyToken, uint256 initialPrice, uint32 maxAmount) ERC721("FestiTicket", "FTCK") public {
      require(maxAmount > 0);
      _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
      _setupRole(MINTER_ROLE, _msgSender());
      _setupRole(PAUSER_ROLE, _msgSender());
      _maxAmount = maxAmount;
      _currencyToken = currencyToken;
      _initialPrice = initialPrice;
      _setBaseURI("http://cryptofestival.com/ticket/");
    }

    // Prevent NFT transfers unless sender has the TRANSFER_ROLE.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        require(hasRole(TRANSFER_ROLE, _msgSender()), "Tickets can only be transfered by whoever has the TRANSFER_ROLE");
    }

    function mint(address to) public virtual returns (uint256){
      require(hasRole(MINTER_ROLE, _msgSender()), "Tickets can only be minted by whoever has the MINTER_ROLE");
      require(_tokenIdTracker.current() < _maxAmount);
      uint256 tokenId = _tokenIdTracker.current();
      _mint(to, tokenId);
      _tokenIdTracker.increment();
      return tokenId;
    }

    function getOriginalPrice() external view returns (uint256) {
      return _initialPrice;
    }

    function getTicketTotal() external view returns (uint256) {
      return _tokenIdTracker.current();
    }

    function getCurrency() external view returns (address) {
      return address(_currencyToken); //TODO Correct?
    }

    function ticketsAvailable() external view returns (bool) {
      return _tokenIdTracker.current() <= _maxAmount;
    }
}
