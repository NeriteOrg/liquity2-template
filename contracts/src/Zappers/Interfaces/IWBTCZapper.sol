// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IZapper.sol";

interface IWBTCZapper is IZapper {
    function openTroveWithWBTC(OpenTroveParams calldata _params) external returns (uint256);
    function closeTroveToWBTC(uint256 _troveId) external;
    function addCollWithWBTC(uint256 _troveId, uint256 _amount) external;
    function withdrawCollToWBTC(uint256 _troveId, uint256 _amount) external;
    function adjustTroveWithWBTC(uint256 _troveId, uint256 _collAmount, uint256 _debtAmount) external;
    function closeTroveFromCollateralWithWBTC(uint256 _troveId, uint256 _flashLoanAmount, uint256 _minExpectedCollateral) external;
}