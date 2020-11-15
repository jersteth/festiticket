pragma solidity ^0.6.2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Pausable.sol";
import "./CurrencyToken.sol";

contract FestiTicket is ERC721Pausable, AccessControl {
    using Counters for Counters.Counter;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

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

    function mint(address to) public virtual returns (uint256){
      require(hasRole(MINTER_ROLE, _msgSender()), "ERC721PresetMinterPauserAutoId: must have minter role to mint");
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
