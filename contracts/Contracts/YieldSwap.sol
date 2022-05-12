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

    uint256 public totalEthInPool;
    uint256 public totalUsdtInPool;

    uint256 internal multplier_feed = 10**10;
    uint256 internal multplier_usd = 10**8;
    uint256 internal multplier_decimal = 10**18;

    uint256 priceFeedDecimals = 10**8;
    uint256 ethDecimals = 10**18; // eth decimals
    uint256 tokenDecimals = 10**6; // usdt token decimals

    AggregatorV3Interface internal eth_usd_price_feed;

    uint256 public strategyPercent = 10;
    uint256 public buySellSteps = 5;
    address public manager;

    struct UserInfo {
        address userAddress;
        uint256 tokenBalance; // eth
        uint256 fiatBalance; // usdt
        uint256 fiatAmountForEachOrder;
        uint256 ethAmountForEachOrder;
        uint256 depositTimeStamp;
        uint256 lastEthPrice;
    }

    mapping(address => UserInfo) public users;
    mapping(address => bool) public stakers;

    //list of order prices for each user
    uint256[] orderPrices;

    mapping(uint256 => address) orderUsers;

    // current buy and sell counts of each index [2, 5] exp: 2 buy and 5 sells executed
    mapping(uint256 => uint256[]) orderCurrentBuySellGridCounts;

    // percent change for buy and sell on orders for each user
    mapping(address => uint256[]) userBuySellChange;

    // number of steps for buy and sell defined buy users
    mapping(address => uint256[]) userBuySellGridSize;

    /**
     * Network: Koven Testnet
     */

    address internal ethUsdDataFeedKoven =
        0x9326BFA02ADD2366b30bacB125260Af641031331;
    address internal maticUsdDataFeedMumbai =
        0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;

    uint256 public fee = 250000000000000000; // fee in 18 decimal wei value
    uint256 public totalFee;

    constructor() {
        eth_usd_price_feed = AggregatorV3Interface(ethUsdDataFeedKoven);

        manager = msg.sender;

        // init inital pool reserves
        totalEthInPool = 0;
        totalUsdtInPool = 0;
    }

    event UpdateStrategy(uint256 Percentage);
    event Staked(address userAddress, uint256 fiatAmount);
    event Unstaked(address userAddress, uint256 fiatAmount);
    event StartYieldSwap(address userAddress, uint256 tokenAmount);

    function getEthPriceUsd() public view returns (uint256) {
        (, int256 price, , , ) = eth_usd_price_feed.latestRoundData();
        return price.toUint256();
    }

    // get usdt equivalent eth amount based on current eth price
    // enter amount in wei considering usdt to 6 decimal token
    function convertUsdtToEth(uint256 _usdAmount, uint256 ethPriceInUSD)
        public
        view
        returns (uint256)
    {
        return
            _usdAmount.mul(priceFeedDecimals).mul(ethDecimals).div(
                ethPriceInUSD.mul(tokenDecimals)
            );
    }

    // enter amount in wei considering usdt to 6 decimal token
    function convertEthToUsdt(uint256 _ethAmount, uint256 ethPriceInUSD)
        public
        view
        returns (uint256)
    {
        return
            _ethAmount.mul(ethPriceInUSD).mul(tokenDecimals).div(
                ethDecimals.mul(priceFeedDecimals)
            );
    }

    // Write methods

    // 1. startYieldSwap Deposit and ready for trade.  done
    // 2. Buy Tokens
    // 3. Sell Tokens
    // 4. Update Strategy Percentage
    // 5. withdraw user tokens
    // 6. deposit eth liquidity {Owner} done
    // 7. withdraw eth liquidity {Owner}  done

    function UpdateStrategyPercentage(uint256 _percent)
        public
        onlyOwner
        returns (uint256)
    {
        strategyPercent = _percent;
        emit UpdateStrategy(_percent);
        return _percent;
    }

    function buyEthWithFee(
        address _account,
        uint256 _usdtAmount,
        uint256 _ethPrice
    ) internal {
        uint256 usdtAfterFee = _usdtAmount.mul(100 - fee.div(ethDecimals)).div(
            100
        );
        uint256 orderFee = convertUsdtToEth(
            _usdtAmount - usdtAfterFee,
            _ethPrice
        );

        totalFee += orderFee;
        totalEthInPool += orderFee;

        UserInfo storage user = users[_account];

        uint256 minEthReceived = convertUsdtToEth(usdtAfterFee, _ethPrice);

        totalEthInPool -= minEthReceived;
        user.tokenBalance += minEthReceived;

        totalUsdtInPool += usdtAfterFee;
        user.fiatBalance -= _usdtAmount;
    }

    function sellEthWithFee(
        address _account,
        uint256 _ethAmount,
        uint256 _ethPrice
    ) internal {
        uint256 ethAfterFee = _ethAmount.mul(100 - fee.div(ethDecimals)).div(
            100
        );
        uint256 orderFee = _ethAmount - ethAfterFee;

        totalFee += orderFee;
        totalEthInPool += orderFee;

        UserInfo storage user = users[_account];

        uint256 minUsdtReceived = convertEthToUsdt(ethAfterFee, _ethPrice);

        totalUsdtInPool -= minUsdtReceived;
        user.fiatBalance += minUsdtReceived;

        totalEthInPool += ethAfterFee;
        user.tokenBalance -= _ethAmount;
    }

    // Function to deposit fiat into pool
    function startYieldSwap(address _token, uint256 _tokenAmount) public {
        require(_tokenAmount > 0, "Stake amount should be greater than 0.");

        uint256 ethPriceInUSD = getEthPriceUsd();
        // buy eth with half of the _tokenAmount, with current eth price
        uint256 usdtAmountForEth = _tokenAmount.div(2);
        uint256 remainingUsdt = _tokenAmount - usdtAmountForEth;
        uint256 minEthToBought = convertUsdtToEth(
            usdtAmountForEth,
            ethPriceInUSD
        );

        require(
            totalEthInPool > minEthToBought,
            "Not enough pool balance to start trade"
        );

        IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);

        UserInfo storage user = users[msg.sender];

        buyEthWithFee(user.userAddress, usdtAmountForEth, ethPriceInUSD);
        // // update user and pool balances on deposit start
        // totalUsdtInPool += remainingUsdt;
        // user.fiatBalance +=  remainingUsdt;
        // user.fiatAmountForEachOrder = user.fiatBalance.div(buySellSteps);

        // totalEthInPool -= minEthToBought;
        // user.tokenBalance += minEthToBought;
        // user.ethAmountForEachOrder = user.tokenBalance.div(buySellSteps);

        user.depositTimeStamp = block.timestamp;
        user.lastEthPrice = getEthPriceUsd();

        if (stakers[msg.sender] != true) {
            user.userAddress = msg.sender;
            stakers[msg.sender] = true;
        }
        // update user and pool balances on deposit end

        // configure ordre and mappings start
        orderPrices.push(user.lastEthPrice);
        uint256 currenIndex = orderPrices.length - 1;

        orderCurrentBuySellGridCounts[currenIndex] = [0, 0];

        orderUsers[currenIndex] = msg.sender;
        // configure ordre and mappings start

        emit StartYieldSwap(msg.sender, _tokenAmount);
    }

    function getUserInfo(address _account)
        public
        view
        returns (
            uint256 _ethBalance,
            uint256 _usdtBalance,
            uint256 totalUsdValue,
            uint256 _usdtOrderAmount,
            uint256 _ethOrderAmount
        )
    {
        UserInfo storage user = users[_account];
        _ethBalance = user.tokenBalance;
        _usdtBalance = user.fiatBalance;

        uint256 usdtValue = _usdtBalance.div(tokenDecimals);
        uint256 ethValue = _ethBalance.mul(getEthPriceUsd()).div(ethDecimals);
        totalUsdValue = usdtValue + ethValue;
        _usdtOrderAmount = user.fiatAmountForEachOrder;
        _ethOrderAmount = user.ethAmountForEachOrder;
        return (
            _ethBalance,
            _usdtBalance,
            totalUsdValue,
            _usdtOrderAmount,
            _ethOrderAmount
        );
    }

    //  stake eth reseves into pool
    function Stake() public payable onlyOwner {
        require(msg.value > 0, "Stake amount should be greater than 0.");

        totalEthInPool += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    // Function to withdraw fiat(usdt) from pool
    function Unstake() public onlyOwner returns (bool) {
        require(totalEthInPool > 0, "resevr in pool must be greater than 0.");

        // uint256 ethBalance = address(this).balance;
        address payable to = payable(msg.sender);
        to.transfer(totalEthInPool);

        totalEthInPool -= totalEthInPool;

        emit Unstaked(msg.sender, totalEthInPool);
        return false;
    }

    function percentChange(uint256 oldValue, uint256 newValue)
        internal
        view
        returns (int256)
    {
        int256 numerator = int256(newValue - oldValue);
        int256 percentChange = (numerator * 100) / int256(oldValue);
        return percentChange;
    }

    uint256[] internal orderQue; // store list of order indexes to execute
    uint256[] internal orderTypes; // 1 buy/   0 sell
    uint256 internal lastOrderIndexExecuted;

    function updateOrderIndexes() public {
        uint256 currentEthPrice = getEthPriceUsd();

        for (uint256 i = 0; i < orderPrices.length; i++) {
            uint256 _orderPrice = orderPrices[i];
            address userAddress = orderUsers[i];

            UserInfo memory user = users[userAddress];

            int256 priceChange = percentChange(
                currentEthPrice,
                user.lastEthPrice
            );

            if (priceChange >= 10) {
                // sell order
                orderQue.push(i);
                orderTypes.push(0);
            } else if (priceChange <= -10) {
                orderQue.push(i);
                orderTypes.push(1);
            }
        }
    }

    // add this check before executing runOrder function
    //  if(_orderGridStatus[0] >=  buySellSteps  or _orderGridStatus[1] >=  buySellSteps)

    function runOrder(uint256 _orderIndex, uint256 _ethPriceUsd) public {
        address userAddress = orderUsers[_orderIndex];
        UserInfo storage user = users[userAddress];

        uint256[] memory _orderGridStatus = orderCurrentBuySellGridCounts[
            _orderIndex
        ];

        if (orderTypes[_orderIndex] == 0) {
            // run buy order
            require(
                _orderGridStatus[0] < buySellSteps,
                "All Buy order has been already executed"
            );

            // execute buy order book and update user price in price list
            buyEthWithFee(
                userAddress,
                user.fiatAmountForEachOrder,
                _ethPriceUsd
            );

            orderCurrentBuySellGridCounts[_orderIndex][0] += 1;
        } else {
            //run sell order
            require(
                _orderGridStatus[1] < buySellSteps,
                "All Sell order has been already executed"
            );

            sellEthWithFee(
                userAddress,
                user.ethAmountForEachOrder,
                _ethPriceUsd
            );

            orderCurrentBuySellGridCounts[_orderIndex][1] += 1;
        }
        lastOrderIndexExecuted = _orderIndex;
    }

    // function autosell() internal {}

    // function withdrawAll() public {}

    // function userBalance(address _address) public view {}

    //1. write automatic buy function on price down with 0.25% fee duduction.
    //2. write automatic sell function on price up with 0.25% fee deduction.
    //3. write withdrawAll will withdraw user currrent usdt and eth bought so far.
    //4. get user current balance: show current fiat and eth available and his asset usd value, percent loss/gain.

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory) {
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
