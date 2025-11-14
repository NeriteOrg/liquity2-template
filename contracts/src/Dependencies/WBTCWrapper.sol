// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;
 
import {ERC20Wrapper} from "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Wrapper.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title WBTCWrapper
 * @notice Wraps WBTC to 18 decimals
 * @author MrDeadCe11
 * @dev This contract is used to wrap WBTC to an 18 decimal token for use in evro since all tokens in evro must have 18 decimals.
 */
contract WBTCWrapper is ERC20Wrapper {
    constructor(address _wbtc) ERC20Wrapper(IERC20(_wbtc)) ERC20("Wrapped WBTC", "wWBTC") {
        require(_wbtc != address(0), "WBTCWrapper: WBTC address cannot be zero");
    }
    
    /**
    * @notice Get the number of decimals for the wrapped WBTC
    * @dev this function returns the number of decimals for the wrapped WBTC this wrapper exists to raise wbtc decimals to 18 for evro since all tokens in evro must have 18 decimals.
    * @return uint8 The number of decimals for the wrapped WBTC
    */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

   /**
   * @notice Deposit WBTC and mint wWBTC  for use by user
   * @dev this contract allows the user to deposit WBTC and mint wWBTC for smoother UX
   * @param account The account to deposit WBTC
   * @param amount The amount of WBTC to deposit (in 8 decimals)
   * @return bool True if the deposit was successful
   */
    function depositFor(address account, uint256 amount) public override returns (bool) {
        address sender = _msgSender();
        require(sender != address(this), "ERC20Wrapper: wrapper can't deposit");
        // Transfer amount WBTC (8 decimals) from sender
        SafeERC20.safeTransferFrom(underlying(), sender, address(this), amount);
        // Mint amount * 1e10 wrapped tokens (18 decimals) to account
        uint256 amountToMint = amount * 1e10; // add 10 decimals to bring from 8 to 18 decimals
        _mint(account, amountToMint);
        return true;
    }

   /**
   * @notice Withdraw wWBTC and burn it to get WBTC
   * @dev this contract allows the user to withdraw wWBTC and burn it to get WBTC for smoother UX requires user to approve this contract before depositing coll
   * @param account The account to withdraw WBTC to
   * @param amount The amount of wWBTC to burn (in 18 decimals)
   * @return bool True if the withdrawal was successful
   */
    function withdrawTo(address account, uint256 amount) public override returns (bool) {
        require(account != address(this), "ERC20Wrapper: invalid receiver");
        // Burn amount wrapped tokens (18 decimals)
        _burn(_msgSender(), amount);
        // Transfer amount / 1e10 WBTC (8 decimals) to account
        uint256 amountToWithdraw = amount / 1e10; // convert from 18 decimals to 8 decimals
        SafeERC20.safeTransfer(underlying(), account, amountToWithdraw);
        return true;
    }

   /**
   * @notice Deposit WBTC and mint WWBTC for use by user
   * @dev this contract allows the user to deposit WBTC and mint WWBTC to msg.sender
   * @param amount The amount of WBTC to deposit (in 8 decimals)
   * @return bool True if the deposit was successful
   */
    function deposit(uint256 amount) public returns (bool) {
        address sender = _msgSender();
        require(sender != address(this), "ERC20Wrapper: wrapper can't deposit");
        // Transfer amount WBTC (8 decimals) from sender
        SafeERC20.safeTransferFrom(underlying(), sender, address(this), amount);
        // Mint amount * 1e10 wrapped tokens (18 decimals) to sender
        uint256 amountToMint = amount * 1e10; // add 10 decimals to bring from 8 to 18 decimals
        _mint(sender, amountToMint);
        return true;
    }

   /**
   * @notice Withdraw WWBTC and burn it to get WBTC
   * @dev this contract allows the user to withdraw WWBTC and burn it to get WBTC to msg.sender
   * @param amount The amount of WWBTC to withdraw (in 18 decimals)
   * @return bool True if the withdrawal was successful
   */

    function withdraw(uint256 amount) public returns (bool) {
        address sender = _msgSender();
        require(sender != address(this), "ERC20Wrapper: wrapper can't withdraw");
        // Burn amount wrapped tokens (18 decimals)
        _burn(sender, amount);
        // Transfer amount / 1e10 WBTC (8 decimals) to sender
        uint256 amountToWithdraw = amount / 1e10; // convert from 18 decimals to 8 decimals
        SafeERC20.safeTransfer(underlying(), sender, amountToWithdraw);
        return true;
    }
}