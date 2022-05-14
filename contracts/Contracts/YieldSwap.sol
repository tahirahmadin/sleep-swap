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
    uint256[] public orderPrices;

    mapping(uint256 => address) orderUsers;

    // current buy and sell counts of each index [2, 5] exp: 2 buy and 5 sells executed
    mapping(uint256 => uint256[]) orderCurrentBuySellGridCounts;

    // percent change for buy and sell on orders for each user
    mapping(address => uint256[]) userBuySellChange;

    // number of steps for buy and sell defined buy users
    mapping(address => uint256[]) userBuySellGridSize;

    uint256[] public orderQue; // store list of order indexes to execute
    uint256[] public orderTypes; // 1 buy/   0 sell
    uint256 public lastOrderIndexExecuted = 0;

    /**
     * Network: Koven Testnet
     */

    address internal ethUsdDataFeedKoven =
        0x9326BFA02ADD2366b30bacB125260Af641031331;
    address internal maticUsdDataFeedMumbai =
        0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;

    uint256 public totalFee;

    constructor() {
        eth_usd_price_feed = AggregatorV3Interface(ethUsdDataFeedKoven);

        manager = msg.sender;

        // init inital pool reserves
        totalEthInPool = 0;
        totalUsdtInPool = 0;
    }

    event UpdateStrategy(uint256 Percentage);
    event DepositReserve(address userAddress, uint256 ethAmount);
    event WithdrawReserves(
        address userAddress,
        uint256 ethAmount,
        uint256 feeAmount
    );
    event StartYieldSwap(address userAddress, uint256 tokenAmount);
    event WithdrawUserFunds(address, uint256 userEth, uint256 userUsdt);

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

    // 4. Update Strategy Percentage
    // 5. withdraw user tokens

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
        uint256 usdtAfterFee = _usdtAmount.mul(399).div(4).div(100);
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
        uint256 ethAfterFee = _ethAmount.mul(399).div(4).div(100);
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
    function startYieldSwap(
        address _token,
        uint256 _tokenAmount,
        uint256 ethPriceInUSD
    ) public {
        require(_tokenAmount > 0, "Stake amount should be greater than 0.");

        // uint256 ethPriceInUSD = getEthPriceUsd();
        // buy eth with half of the _tokenAmount, with current eth price
        uint256 usdtAmountForEth = _tokenAmount.div(2);
        uint256 remainingUsdt = _tokenAmount - usdtAmountForEth;

        // deduct fee
        uint256 usdtAfterFee = usdtAmountForEth.mul(399).div(4).div(100);
        uint256 orderFee = convertUsdtToEth(
            usdtAmountForEth - usdtAfterFee,
            ethPriceInUSD
        );

        totalFee += orderFee;
        totalEthInPool += orderFee;

        uint256 minEthReceived = convertUsdtToEth(usdtAfterFee, ethPriceInUSD);

        require(
            totalEthInPool > minEthReceived,
            "Not enough pool balance to start trade"
        );

        IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);

        UserInfo storage user = users[msg.sender];

        // buyEthWithFee(msg.sender, usdtAmountForEth, ethPriceInUSD);
        // update user and pool balances on deposit start
        totalUsdtInPool += usdtAfterFee;

        user.fiatBalance += remainingUsdt;
        user.fiatAmountForEachOrder = user.fiatBalance.div(buySellSteps);

        totalEthInPool -= minEthReceived;
        user.tokenBalance += minEthReceived;
        user.ethAmountForEachOrder = user.tokenBalance.div(buySellSteps);

        user.depositTimeStamp = block.timestamp;
        user.lastEthPrice = ethPriceInUSD;

        if (stakers[msg.sender] != true) {
            user.userAddress = msg.sender;
            stakers[msg.sender] = true;
        }
        // update user and pool balances on deposit end

        // configure ordre and mappings start
        orderPrices.push(ethPriceInUSD);
        uint256 currenIndex = orderPrices.length - 1;

        orderCurrentBuySellGridCounts[currenIndex] = [0, 0];

        orderUsers[currenIndex] = msg.sender;
        // configure order and mappings end

        emit StartYieldSwap(msg.sender, _tokenAmount);
    }

    function getUserInfo(address _account)
        public
        view
        returns (
            uint256 _tokenBalance,
            uint256 _fiatBalance,
            uint256 totalUsdValue,
            uint256 _usdtOrderAmount,
            uint256 _ethOrderAmount,
            uint256 _ethPrice
        )
    {
        UserInfo storage user = users[_account];
        _tokenBalance = user.tokenBalance;
        _fiatBalance = user.fiatBalance;

        uint256 usdtValue = _fiatBalance.div(tokenDecimals);
        uint256 ethValue = _tokenBalance.mul(getEthPriceUsd()).div(ethDecimals);
        totalUsdValue = usdtValue + ethValue;
        _usdtOrderAmount = user.fiatAmountForEachOrder;
        _ethOrderAmount = user.ethAmountForEachOrder;
        _ethPrice = user.lastEthPrice;
        return (
            _tokenBalance,
            _fiatBalance,
            totalUsdValue,
            _usdtOrderAmount,
            _ethOrderAmount,
            _ethPrice
        );
    }

    //  stake eth reseves into pool
    function depositEth() public payable onlyOwner {
        require(msg.value > 0, "Stake amount should be greater than 0.");

        totalEthInPool += msg.value;

        emit DepositReserve(msg.sender, msg.value);
    }

    // Function to withdraw reserves from pool
    function withdrawEth() public onlyOwner {
        require(totalEthInPool > 0, "resevr in pool must be greater than 0.");

        // uint256 ethBalance = address(this).balance;
        address payable to = payable(msg.sender);
        uint256 _totalReserveEth = totalEthInPool;
        uint256 _totalFeeEth = totalFee;
        to.transfer(_totalReserveEth + _totalFeeEth);

        totalEthInPool -= _totalReserveEth;
        totalFee -= _totalFeeEth;

        emit WithdrawReserves(msg.sender, _totalReserveEth, _totalFeeEth);
    }

    // Withdraw user's current eth and usdt
    function withdrawUserFunds(address _token) public {
        UserInfo storage user = users[msg.sender];

        uint256 userUsdt = user.fiatBalance;
        uint256 userEth = user.tokenBalance;

        address payable to = payable(msg.sender);
        to.transfer(userEth);

        IERC20(_token).transfer(msg.sender, userUsdt);

        user.tokenBalance -= userEth;
        user.fiatBalance -= userUsdt;

        user.ethAmountForEachOrder = 0;
        user.fiatAmountForEachOrder = 0;

        emit WithdrawUserFunds(msg.sender, userEth, userUsdt);
    }

    // add this check before executing runOrder function
    //  if(_orderGridStatus[0] >=  buySellSteps  or _orderGridStatus[1] >=  buySellSteps)
    // 2 stage
    function runOrder(uint256 _orderIndex, uint256 _ethPriceUsd) public {
        require(
            _orderIndex >= lastOrderIndexExecuted,
            "This order is already executed"
        );

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

    function percentChange(int256 oldValue, int256 newValue)
        public
        view
        returns (int256)
    {
        return ((newValue - oldValue) * 100) / oldValue;
    }

    // 1
    function updateOrderIndexes(uint256 currentEthPrice) public {
        for (uint256 i = 0; i < orderPrices.length; i++) {
            uint256 _orderPrice = orderPrices[i];

            int256 priceChange = percentChange(
                int256(_orderPrice),
                int256(currentEthPrice)
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

    //1. write automatic buy function on price down with 0.25% fee duduction.
    //2. write automatic sell function on price up with 0.25% fee deduction.
    //3. write withdrawAll will withdraw user currrent usdt and eth bought so far.
    //4. get user current balance: show current fiat and eth available and his asset usd value, percent loss/gain.

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = false;
        // check if order que is empty then update order que

        if (orderQue.length == lastOrderIndexExecuted) {
            // order que is empty
            // update order index
            // updateOrderIndexes();
        }

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

        // iterate order que and run each order
        uint256 ethPrice = getEthPriceUsd();
        for (uint256 i = 0; i < 10; i++) {
            runOrder(i, ethPrice);
        }
    }

    // test version of upkeep function
    function runOrders(uint256 ethPrice) public {
        uint256 ordersToRun;
        uint256 orderQueLength = orderQue.length - lastOrderIndexExecuted;
        if (orderQueLength > 10) {
            ordersToRun = 10;
        } else {
            ordersToRun = orderQueLength;
        }

        for (uint256 i = lastOrderIndexExecuted; i < ordersToRun; i++) {
            runOrder(i, ethPrice);
        }
    }

    // test function to momitor structs
    function orderUsersFn(uint256 index) public view returns (address) {
        return orderUsers[index];
    }

    function orderCurrentBuySellGridCountsFn(uint256 index)
        public
        view
        returns (uint256, uint256)
    {
        return (
            orderCurrentBuySellGridCounts[index][0],
            orderCurrentBuySellGridCounts[index][1]
        );
    }
}
