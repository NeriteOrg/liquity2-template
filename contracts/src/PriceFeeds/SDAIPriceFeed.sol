// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "./MainnetPriceFeedBase.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
// import "forge-std/console2.sol";

contract SDAIPriceFeed is MainnetPriceFeedBase {
    IERC4626 public immutable sdai;

    constructor(address _sdaiUsdOracleAddress, uint256 _sdaiUsdStalenessThreshold, address _borrowerOperationsAddress, address _sdaiAddress)
        MainnetPriceFeedBase(_sdaiUsdOracleAddress, _sdaiUsdStalenessThreshold, _borrowerOperationsAddress)
    {
        sdai = IERC4626(_sdaiAddress);
    }

    function fetchPrice() public returns (uint256, bool) {
        // If branch is live and the primary oracle setup has been working, try to use it
        if (priceSource == PriceSource.primary) return _fetchPricePrimary();

        // Otherwise if branch is shut down and already using the lastGoodPrice, continue with it
        assert(priceSource == PriceSource.lastGoodPrice);
        return (lastGoodPrice, false);
    }

    function fetchRedemptionPrice() external returns (uint256, bool) {
        // Use same price for redemption as all other ops in WETH branch
        return fetchPrice();
    }

    //  _fetchPricePrimary returns:
    // - The price
    // - A bool indicating whether a new oracle failure was detected in the call
    function _fetchPricePrimary() internal returns (uint256, bool) {
        assert(priceSource == PriceSource.primary);
        (uint256 daiEurPrice, bool daiEurOracleDown) = _getOracleAnswer(ethUsdOracle);

        // Get the DAI rate of the SDAI vault
        uint256 sdaiDaiRate = sdai.convertToAssets(1e18);

        // If the DAI-EUR Chainlink response was invalid in this transaction, return the last good ETH-USD price calculated
        if (daiEurOracleDown) return (_shutDownAndSwitchToLastGoodPrice(address(ethUsdOracle.aggregator)), true);
        if (sdaiDaiRate == 0) return (_shutDownAndSwitchToLastGoodPrice(address(ethUsdOracle.aggregator)), true);
        
        uint256 sdaiEurPrice = daiEurPrice * sdaiDaiRate / 1e18;
        lastGoodPrice = sdaiEurPrice;

        return (sdaiEurPrice, false);
    }
}
