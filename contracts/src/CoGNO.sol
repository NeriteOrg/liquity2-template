// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "./Interfaces/ICollateralRegistry.sol";
import "./Interfaces/ITroveManager.sol";
import "./Interfaces/ITroveNFT.sol";
import "./Types/LatestTroveData.sol";

contract CollateralGNO is ERC20 {

    ITroveManager public immutable troveManager;

    constructor(address _troveManagerAddress) ERC20("coGNO", "coGNO") {
        require(_troveManagerAddress != address(0), "Invalid trove manager address");
        troveManager = ITroveManager(_troveManagerAddress);
    }

    //override balance of to get the current collateral of the users GNO safes.
    function balanceOf(address account) public view override returns (uint256) {
        ITroveNFT troveNFT = troveManager.troveNFT();
        
        uint256[] memory troveIds = troveNFT.ownerToTroveIds(account);
        uint256 totalCollateral = 0;
        
        for (uint256 i = 0; i < troveIds.length;) {
            LatestTroveData memory troveData = troveManager.getLatestTroveData(troveIds[i]);
            totalCollateral += troveData.entireColl;

            unchecked {
                i++;
            }
        }
        
        return totalCollateral;
    }

    ///////////////// ERC 20 Override functions /////////////////
   // returns the total collateral balance of the entire gno branch
   function totalSupply() public view override returns (uint256) {
        return troveManager.getEntireBranchColl();
    }

    function transfer(address /*to*/, uint256 /*amount*/) public override returns (bool) {
        revert("Token is non-transferable");
    }

    function transferFrom(address /*from*/, address /*to*/, uint256 /*amount*/) public override returns (bool) {
        revert("Token is non-transferable");
    }
 
    function approve(address /*spender*/, uint256 /*amount*/) public override returns (bool) {
        revert("Token is non-transferable");
    }
    

}