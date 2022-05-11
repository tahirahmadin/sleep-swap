//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YeildSwap is KeeperCompatibleInterface, Ownable {
    using SafeCast for int256;
    using SafeMath for uint256;
    IERC20 private usdtToken;

    uint256 multplier_feed = 10**10;
    uint256 multplier_usd = 10**8;
    uint256 multplier_decimal = 10**18;

    AggregatorV3Interface internal matic_usd_price_feed;

    uint256 public strategyPercent = 10;
    address public manager;

    struct UserInfo {
        address userAddress;
        uint256 tokenBalance;
        uint256 fiatBalance;
    }
    mapping(address => UserInfo) public users;
    mapping(address => bool) public stakers;

    /**
     * Network: Matic Testnet
     */
    constructor(IERC20 _fiatToken) {
        matic_usd_price_feed = AggregatorV3Interface(
            0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
        );
        usdtToken = IERC20(_fiatToken);
        manager = msg.sender;
    }

    event UpdateStrategy(uint256 Percentage);
    event Staked(address userAddress, uint256 fiatAmount);
    event Unstaked(address userAddress, uint256 fiatAmount);

    function getMaticUsd() public view returns (uint256) {
        (, int256 price, , , ) = matic_usd_price_feed.latestRoundData();
        return price.toUint256();
    }

    function maticPriceWei() public view returns (uint256) {
        (, int256 price, , , ) = matic_usd_price_feed.latestRoundData();
        return price.toUint256().mul(multplier_feed);
    }

    function convertMaticUsd(uint256 _usdAmount) public view returns (uint256) {
        uint256 MaticPriceInUSD = getMaticUsd();

        return
            _usdAmount.mul(multplier_usd).mul(multplier_decimal).div(
                MaticPriceInUSD
            );
    }

    // Write methods

    // 1. Deposit Tokens
    // 2. Buy Tokens
    // 3. Sell Tokens
    // 4. Update Strategy Percentage

    function UpdateStrategyPercentage(uint256 _percent)
        public
        onlyOwner
        returns (uint256)
    {
        strategyPercent = _percent;
        emit UpdateStrategy(_percent);
        return _percent;
    }

    // Function to deposit fiat into pool
    function Stake(uint256 _fiatAmount) public returns (bool) {
        require(_fiatAmount > 0, "Stake amount should be greater than 0.");

        if (stakers[msg.sender]) {
            UserInfo storage user = users[msg.sender];
            user.fiatBalance = user.fiatBalance.add(_fiatAmount);
        } else {
            UserInfo storage user = users[msg.sender];
            user.userAddress = msg.sender;
            user.fiatBalance = _fiatAmount;
            user.tokenBalance = 0;
            stakers[msg.sender] = true;
        }
        emit Staked(msg.sender, _fiatAmount);
        return true;
    }

    // Function to withdraw fiat(usdt) from pool
    function Unstake(uint256 _fiatAmount) public returns (bool) {
        require(_fiatAmount > 0, "Stake amount should be greater than 0.");
        require(
            users[msg.sender].fiatBalance >= _fiatAmount,
            "UnStake amount should be less than staked amount."
        );

        if (stakers[msg.sender]) {
            UserInfo storage user = users[msg.sender];
            user.fiatBalance = user.fiatBalance.sub(_fiatAmount);
            emit Unstaked(msg.sender, _fiatAmount);
            return true;
        }
        return false;
    }

    function autoBuy() internal {}

    function autosell() internal {}

    function withdrawAll() public {}

    function userBalance(address _address) public view {}

    //1. write automatic buy function on price down with 0.25% fee duduction.
    //2. write automatic sell function on price up with 0.25% fee deduction.
    //3. write withdrawAll will withdraw user currrent usdt and eth bought so far.
    //4. get user current balance: show current fiat and eth available and his asset usd value, percent loss/gain.

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        upkeepNeeded = false;
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        //We highly recommend revalidating the upkeep in the performUpkeep function
        // if ((block.timestamp - lastTimeStamp) > interval ) {
        //     lastTimeStamp = block.timestamp;
        //     counter = counter + 1;
        // }
        // We don't use the performData in this example. The performData is generated by the Keeper's call to your checkUpkeep function
    }
}
