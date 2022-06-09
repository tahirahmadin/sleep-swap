//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SleepSwap is KeeperCompatibleInterface, Ownable {
    using SafeCast for int256;
    using SafeMath for uint256;

    uint256 public totalEthInPool;
    uint256 public totalUsdtInPool;
    uint256 public totalDeposits;

    uint256 priceFeedDecimals = 10**8;
    uint256 ethDecimals = 10**18; // eth decimals
    uint256 tokenDecimals = 10**6; // usdt token decimals
    // polygon: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
    // koven: 0xa36085F69e2889c224210F603D836748e7dC0088
    // address LINK = 0xa36085F69e2889c224210F603D836748e7dC0088;

    AggregatorV3Interface internal matic_usd_price_feed;
    // AggregatorV3Interface internal link_matic_price_feed;
    // AggregatorV3Interface internal matic_usd_price_feed;

    address public manager;

    struct UserInfo {
        address userAddress;
        uint256 totalStaked; // usdt amount user added initially
        uint256 tokenBalance; // current eth balance
        uint256 fiatBalance; // current usdt balance
        uint256 fiatAmountForEachOrder;
        uint256 ethAmountForEachOrder;
        uint256 depositTimeStamp;
        uint256 lastEthPrice;
    }

    mapping(address => UserInfo) public users;
    mapping(address => bool) public stakers;

    //list of order prices for each user
    uint256[] public orderPrices;

    mapping(uint256 => address) orderUsers; // mapping of orders to it's corresponding user's address

    mapping(address => uint256) userOrders; // mapping of user address to it's current order index

    mapping(uint256 => int256) orderStatus; // 0: active, 1 : completed, -1: cancelled ( if user withdraw funds before completion )

    // current buy and sell counts of each index [2, 5] exp: 2 buy and 5 sells executed
    mapping(uint256 => uint256[]) orderCurrentBuySellGridCounts; // 0: buyCounts, 1: sellCounts

    // percent change for buy and sell on orders for each user
    mapping(address => int256) userBuySellChange;

    // number of steps for buy and sell defined buy users
    mapping(address => uint256) userBuySellGridSize;

    uint256[] public orderQue; // store list of order indexes to execute
    uint256[] public orderTypes; // 0 buy/   1 sell
    uint256 public orderQuePointer = 0;

    //mumbai:  0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
    // kovan: 0x9326BFA02ADD2366b30bacB125260Af641031331
    address internal maticUsdDataFeed =
        0x9326BFA02ADD2366b30bacB125260Af641031331;

    // // link-usdt; koven: 	0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0
    // // link-matic: mumbai 0x12162c3E810393dEC01362aBf156D7ecf6159528
    // address internal linkMaticDataFeedMumbai =
    //     0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0;

    uint256 public totalFee;

    constructor() {
        matic_usd_price_feed = AggregatorV3Interface(maticUsdDataFeed);

        manager = msg.sender;

        // init inital pool reserves
        totalEthInPool = 0;
        totalUsdtInPool = 0;
    }

    event DepositReserve(
        address userAddress,
        uint256 ethAmount,
        uint256 tokenAmount
    );
    event WithdrawReserves(
        address userAddress,
        uint256 ethAmount,
        uint256 feeAmount
    );
    event StartYieldSwap(
        address userAddress,
        uint256 tokenAmount,
        uint256 gridSize,
        int256 percent,
        uint256 ethPrice
    );
    event WithdrawUserFunds(address user, uint256 userUsdt, uint256 ethPrice);
    event RunOrder(
        address user,
        string orderType,
        uint256 ethPirce,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 fee
    );

    // function getPriceUsd() public view returns (uint256) {
    //     (, int256 priceUsd, , , ) = matic_usd_price_feed.latestRoundData();

    //     // (, int256 maticUsdPrice, , , ) = matic_usd_price_feed.latestRoundData();
    //     // return  linkMaticPrice.mul(maticUsdPrice).div(priceFeedDecimals); // use this for polygon chain
    //     return priceUsd.toUint256();
    // }
    uint256 public testEthPriceUsd = 200000000000;

    // mocking eth price feed for testing
    function getPriceUsd() public view returns (uint256) {
        return testEthPriceUsd;
    }

    function setPriceUsd(uint256 _price) public payable {
        testEthPriceUsd = _price;
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

    // Function to deposit fiat into pool
    function startYieldSwap(
        address _token,
        uint256 _tokenAmount,
        uint256 _gridCount,
        int256 _percentChange
    ) public {
        require(_tokenAmount > 0, "Stake amount should be greater than 0.");

        require(_gridCount >= 2, "Grid count must be greater than 3");
        require(_percentChange >= 1, "percent must be greater than 10");

        uint256 ethPriceInUSD = getPriceUsd();
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
        // totalEthInPool += orderFee;

        uint256 minEthReceived = convertUsdtToEth(usdtAfterFee, ethPriceInUSD);

        require(
            totalEthInPool > minEthReceived,
            "Not enough pool balance to start trade"
        );

        IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);

        UserInfo storage user = users[msg.sender];

        // update user and pool balances on deposit start
        totalUsdtInPool += usdtAfterFee;

        user.fiatBalance += remainingUsdt;
        user.fiatAmountForEachOrder = user.fiatBalance.div(_gridCount);

        totalEthInPool -= minEthReceived;
        user.tokenBalance += minEthReceived;
        user.ethAmountForEachOrder = user.tokenBalance.div(_gridCount);

        user.depositTimeStamp = block.timestamp;
        user.lastEthPrice = ethPriceInUSD;

        user.totalStaked += _tokenAmount;

        totalDeposits += _tokenAmount;

        if (stakers[msg.sender] != true) {
            user.userAddress = msg.sender;
            stakers[msg.sender] = true;
        }
        // update user and pool balances on deposit end

        // configure ordre and mappings start
        orderPrices.push(ethPriceInUSD);
        uint256 orderIndex = orderPrices.length - 1;

        orderCurrentBuySellGridCounts[orderIndex] = [0, 0];

        orderUsers[orderIndex] = msg.sender;

        userOrders[msg.sender] = orderIndex;

        orderStatus[orderIndex] = 0;

        userBuySellGridSize[msg.sender] = _gridCount;
        userBuySellChange[msg.sender] = _percentChange;
        // configure order and mappings end

        emit StartYieldSwap(
            msg.sender,
            _tokenAmount,
            _gridCount,
            _percentChange,
            ethPriceInUSD
        );
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
        // totalEthInPool += orderFee;

        UserInfo storage user = users[_account];

        uint256 minEthReceived = convertUsdtToEth(usdtAfterFee, _ethPrice);

        totalEthInPool -= minEthReceived;
        user.tokenBalance += minEthReceived;

        totalUsdtInPool += _usdtAmount;
        user.fiatBalance -= _usdtAmount;

        emit RunOrder(
            _account,
            "buy",
            _ethPrice,
            _usdtAmount,
            minEthReceived,
            orderFee
        );
    }

    function sellEthWithFee(
        address _account,
        uint256 _ethAmount,
        uint256 _ethPrice
    ) internal {
        uint256 ethAfterFee = _ethAmount.mul(399).div(4).div(100);
        uint256 orderFee = _ethAmount - ethAfterFee;

        totalFee += orderFee;
        // totalEthInPool += orderFee;

        UserInfo storage user = users[_account];

        uint256 minUsdtReceived = convertEthToUsdt(ethAfterFee, _ethPrice);

        require(
            totalUsdtInPool >= minUsdtReceived,
            "Not enough token in pool to sell eth"
        );
        totalUsdtInPool -= minUsdtReceived;

        user.fiatBalance += minUsdtReceived;

        totalEthInPool += _ethAmount;
        require(
            user.tokenBalance >= _ethAmount,
            "Not enough eth balance to sell"
        );
        user.tokenBalance -= _ethAmount;

        emit RunOrder(
            _account,
            "sell",
            _ethPrice,
            _ethAmount,
            minUsdtReceived,
            orderFee
        );
    }

    function getPoolInfo()
        public
        view
        returns (
            uint256 _totalEthReserve,
            uint256 _totalFee,
            uint256 _totalDeposits,
            uint256 _totalOrders,
            uint256 _ethPrice
        )
    {
        _totalEthReserve = totalEthInPool;
        _totalFee = totalFee;
        _totalDeposits = totalDeposits;
        _totalOrders = orderQue.length;
        _ethPrice = getPriceUsd();
        return (
            _totalEthReserve,
            _totalFee,
            _totalDeposits,
            _totalOrders,
            _ethPrice
        );
    }

    function getUserInfo(address _account)
        public
        view
        returns (
            uint256 _totalStaked,
            uint256 _tokenBalance,
            uint256 _fiatBalance,
            uint256 totalUsdValue,
            uint256 _usdtOrderAmount,
            uint256 _ethOrderAmount,
            uint256 _ethPrice
        )
    {
        UserInfo storage user = users[_account];
        _totalStaked = user.totalStaked;
        _tokenBalance = user.tokenBalance;
        _fiatBalance = user.fiatBalance;

        uint256 usdtValue = _fiatBalance.div(tokenDecimals);
        uint256 ethValue = _tokenBalance.mul(getPriceUsd()).div(ethDecimals);
        totalUsdValue = usdtValue + ethValue;
        _usdtOrderAmount = user.fiatAmountForEachOrder;
        _ethOrderAmount = user.ethAmountForEachOrder;
        _ethPrice = user.lastEthPrice;
        return (
            _totalStaked,
            _tokenBalance,
            _fiatBalance,
            totalUsdValue,
            _usdtOrderAmount,
            _ethOrderAmount,
            _ethPrice
        );
    }

    function getUserOrderStatus(address _account)
        public
        view
        returns (
            uint256 _buyRuns,
            uint256 _sellRuns,
            uint256 _grids,
            int256 _percent,
            uint256 _currenOrderPrice
        )
    {
        uint256 userOrderIndex = userOrders[_account];
        uint256[] storage userOrderStatus = orderCurrentBuySellGridCounts[
            userOrderIndex
        ];

        _grids = userBuySellGridSize[_account];
        _percent = userBuySellChange[_account];
        _currenOrderPrice = orderPrices[userOrderIndex];

        _buyRuns = userOrderStatus[0];
        _sellRuns = userOrderStatus[1];
        return (_buyRuns, _sellRuns, _grids, _percent, _currenOrderPrice);
    }

    //  stake eth reseves into pool
    function depositReserve(address _token, uint256 _tokenAmount)
        public
        payable
        onlyOwner
    {
        require(msg.value > 0, "matic amount should be greater than 0.");
        require(
            _tokenAmount > 0,
            "tokenAmount amount should be greater than 0."
        );

        IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);
        totalUsdtInPool += _tokenAmount;
        totalEthInPool += msg.value;

        emit DepositReserve(msg.sender, msg.value, _tokenAmount);
    }

    // test fn remove after test
    function ethTotalBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // test fn remove after test
    function usdtBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    // Function to withdraw reserves from pool
    function withdrawReserve(address _token)
        public
        onlyOwner
        returns (uint256 _eth, uint256 _usdt)
    {
        require(
            totalEthInPool > 0 || totalUsdtInPool > 0,
            "ETH or USDT reserve in pool must be greater than 0."
        );

        // uint256 ethBalance = address(this).balance;
        address payable to = payable(msg.sender);
        uint256 _totalReserveEth = totalEthInPool;
        uint256 _totalFeeEth = totalFee;
        to.transfer(_totalReserveEth);

        // in case totalusdt is more the actual balance,
        if (totalUsdtInPool > IERC20(_token).balanceOf(address(this))) {
            totalUsdtInPool = IERC20(_token).balanceOf(address(this));
        }

        IERC20(_token).transfer(msg.sender, totalUsdtInPool);

        totalUsdtInPool = 0;
        totalEthInPool = 0;
        totalFee = 0;

        emit WithdrawReserves(msg.sender, _totalReserveEth, _totalFeeEth);
        (_eth, _usdt) = (totalEthInPool, totalUsdtInPool);
        return (_eth, _usdt);
    }

    // convert user funds into usdt before withdraw
    function convertUserFunds(address _account, uint256 _ethPrice) internal {
        UserInfo storage user = users[msg.sender];
        uint256 userEth = user.tokenBalance;
        if (userEth > 0) {
            sellEthWithFee(msg.sender, userEth, _ethPrice);
        }
    }

    // Withdraw user's current eth and usdt
    function withdrawUserFunds(address _token) public {
        // address payable to = payable(msg.sender);
        // to.transfer(userEth);
        // sellEthWithFee(msg.sender, userEth, 200000000000);
        uint256 ethPrice = getPriceUsd();

        convertUserFunds(msg.sender, ethPrice);

        UserInfo storage user = users[msg.sender];
        // uint256 userEth = user.tokenBalance;

        uint256 userUsdt = user.fiatBalance;
        IERC20(_token).transfer(msg.sender, userUsdt);

        if (totalDeposits < user.tokenBalance) {
            totalDeposits = 0;
        } else {
            totalDeposits -= user.fiatBalance;
        }

        user.tokenBalance = 0;
        user.fiatBalance = 0;

        user.ethAmountForEachOrder = 0;
        user.fiatAmountForEachOrder = 0;

        user.totalStaked = 0;

        uint256 userOrderIndex = userOrders[msg.sender];

        if (orderStatus[userOrderIndex] == 0) {
            // stop this order when user withdraw
            orderStatus[userOrderIndex] = -1;
        }

        emit WithdrawUserFunds(msg.sender, userUsdt, ethPrice);
    }

    function percentChange(int256 oldValue, int256 newValue)
        internal
        view
        returns (int256)
    {
        return ((newValue - oldValue) * 100) / oldValue;
    }

    // step 1 generate order que
    function updateOrderIndexes(uint256 currentEthPrice) public {
        for (uint256 i = 0; i < orderPrices.length; i++) {
            uint256 _orderPrice = orderPrices[i];

            int256 priceChange = percentChange(
                int256(_orderPrice),
                int256(currentEthPrice)
            );

            uint256 _orderIndex = i;
            address orderUser = orderUsers[_orderIndex];
            uint256 _buyCount;
            uint256 _sellCount;
            (_buyCount, _sellCount, , , ) = getUserOrderStatus(orderUser);

            int256 _userPriceChange = userBuySellChange[orderUser];
            uint256 _userGridSize = userBuySellGridSize[orderUser];

            if (orderStatus[_orderIndex] == 0) {
                if (
                    priceChange >= _userPriceChange &&
                    _sellCount < _userGridSize
                ) {
                    // sell order
                    orderQue.push(i);
                    orderTypes.push(1);
                } else if (
                    priceChange <= -_userPriceChange &&
                    _buyCount < _userGridSize
                ) {
                    // buy order
                    orderQue.push(i);
                    orderTypes.push(0);
                }
            }
        }
    }

    // step 2 iterate order que and run orders
    function runOrder(
        uint256 _orderIndex,
        uint256 _queIndex,
        uint256 _ethPriceUsd
    ) public {
        // require(
        //     _orderIndex >= orderQuePointer,
        //     "This order is already executed"
        // );

        address userAddress = orderUsers[_orderIndex];
        UserInfo storage user = users[userAddress];

        uint256[] memory _orderGridStatus = orderCurrentBuySellGridCounts[
            _orderIndex
        ];

        uint256 _userGridSize = userBuySellGridSize[userAddress];

        // require(
        //     orderStatus[_orderIndex] == 0,
        //     "Order is either completed or cancelled"
        // );
        if (orderStatus[_orderIndex] == 0) {
            // run order if it is active

            if (orderTypes[_queIndex] == 0) {
                // run buy order
                require(
                    _orderGridStatus[0] < _userGridSize,
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
                    _orderGridStatus[1] < _userGridSize,
                    "All Sell order has been already executed"
                );

                sellEthWithFee(
                    userAddress,
                    user.ethAmountForEachOrder,
                    _ethPriceUsd
                );

                orderCurrentBuySellGridCounts[_orderIndex][1] += 1;
            }
        }

        orderQuePointer = _queIndex + 1; // after executing order from an order que pointer will now point to next element
        orderPrices[_orderIndex] = _ethPriceUsd; // update new eth price after running the order
    }

    uint256 public interval = 60;
    uint256 public lastTimeStamp;
    uint256 public skippedRunns;
    bool public runningOrders;
    bool public runningIndexUpdate;

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = false;
        // check if order que is empty then update order que

        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;

        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        //We highly recommend revalidating the upkeep in the performUpkeep function
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;

            uint256 ethPrice = getPriceUsd();
            if (orderQue.length > orderQuePointer) {
                runOrders(ethPrice);

                runningOrders = true;
                runningIndexUpdate = false;
            } else if (orderPrices.length > 0) {
                updateOrderIndexes(ethPrice);
                runningOrders = false;
                runningIndexUpdate = true;
            } else {
                skippedRunns += 1;
                runningOrders = false;
                runningIndexUpdate = false;
            }
        }
    }

    function runOrders(uint256 ethPrice) public {
        uint256 ordersToRun;
        uint256 orderQueLength = orderQue.length - orderQuePointer;

        if (orderQueLength > 0) {
            if (orderQueLength > 10) {
                ordersToRun = 10;
            } else {
                ordersToRun = orderQue.length;
            }

            for (uint256 i = orderQuePointer; i < ordersToRun; i++) {
                uint256 _orderIndex = orderQue[i];
                uint256 _queIndex = i;
                runOrder(_orderIndex, _queIndex, ethPrice);
            }
        }
    }
}
