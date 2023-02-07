//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SleepSwapV2 {
    using SafeCast for int256;
    using SafeMath for uint256;

    // global data
    uint256 public totalEthInPool;
    uint256 public totalUsdtInPool;
    uint256 public totalDeposits;
    uint256 public totalFee;

    //ownner
    address public manager;

    //token decimals
    uint256 priceFeedDecimals = 10 ** 8;
    uint256 ethDecimals = 10 ** 18; // eth decimals
    uint256 tokenDecimals = 10 ** 6; // usdt token decimals

    // goerli chain
    address internal ethUsdPriceFeed =
        0xCC79157eb46F5624204f47AB42b3906cAA40eaB7;

    AggregatorV3Interface internal eth_usd_price_feed;

    struct Position {
        address user;
        address token;
        uint256 openAmount; // usdt amount user added initially
        uint256 price; // current eth price
        uint256 tokenAmount; // current usdt balance
        uint256 ethAmount;
        uint256 depositTimeStamp;
        uint256 gridSize; // grid size for the strategy
        uint256 percent; // percent of price change for each order
    }

    struct Order {
        address user;
        uint256 price;
        uint256 quantity;
        address token;
        bool isBuy;
    }

    //list of positions
    Position[] public positions;
    // position mapping for each users
    mapping(address => Position) public userPositions;

    // list of all orders  accesible through indices
    Order[] public allBuyOrders;
    Order[] public allSellOrders;

    // mapping of position index to list of order indices
    mapping(uint256 => uint256[]) positionOrders;

    struct PriorityQueue {
        Order[] orders;
        mapping(uint256 => uint256) orderIndices;
        uint256 length;
    }

    PriorityQueue buyOrderBook;
    PriorityQueue sellOrderBook;

    // init contract
    constructor() {
        eth_usd_price_feed = AggregatorV3Interface(ethUsdPriceFeed);

        manager = msg.sender;

        // init inital pool reserves
        totalEthInPool = 0;
        totalUsdtInPool = 0;
    }

    event OpenPosition(
        address userAddress,
        uint256 ethAmount,
        uint256 tokenAmount
    );

    event ClosePosition(
        address userAddress,
        uint256 ethAmount,
        uint256 feeAmount
    );

    event RunOrder(
        address user,
        uint256 price,
        uint256 quantity,
        address token,
        uint256 fee,
        bool isBuy
    );

    function addBuyOrder(
        address _user,
        uint256 _price,
        uint256 _quantity,
        address _token
    ) internal {
        Order memory newOrder = Order({
            user: _user,
            price: _price,
            quantity: _quantity,
            token: _token,
            isBuy: true
        });

        buyOrderBook.orders.push(newOrder);
        buyOrderBook.orderIndices[_price] = buyOrderBook.length;
        buyOrderBook.length++;

        // add buy order to global list
        allBuyOrders.push(newOrder);
    }

    function addSellOrder(
        address _user,
        uint256 _price,
        uint256 _quantity,
        address _token
    ) internal {
        Order memory newOrder = Order({
            user: _user,
            price: _price,
            quantity: _quantity,
            token: _token,
            isBuy: false
        });

        sellOrderBook.orders.push(newOrder);
        sellOrderBook.orderIndices[_price] = sellOrderBook.length;
        sellOrderBook.length++;

        // add sell order to global list
        allSellOrders.push(newOrder);
    }

    function filterOrdersByPrice(
        bool _buy,
        uint256 _price
    ) public view returns (Order[] memory) {
        PriorityQueue storage book = _buy ? buyOrderBook : sellOrderBook;
        Order[] memory filteredOrders = new Order[](book.length);
        uint256 index = 0;
        for (uint i = 0; i < book.length; i++) {
            if (book.orders[i].price >= _price) {
                filteredOrders[index] = book.orders[i];
                index++;
            }
        }
        return filteredOrders;
    }

    uint256 public testEthPriceUsd = 100000000000;

    function getPriceUsd() public view returns (uint256) {
        return testEthPriceUsd;
    }

    function setPriceUsd(uint256 _price) public payable {
        testEthPriceUsd = _price;
    }

    // get usdt equivalent eth amount based on current eth price
    // enter amount in wei considering usdt to 6 decimal token
    function convertUsdtToEth(
        uint256 _usdAmount,
        uint256 ethPriceInUSD
    ) internal view returns (uint256) {
        return
            _usdAmount.mul(priceFeedDecimals).mul(ethDecimals).div(
                ethPriceInUSD.mul(tokenDecimals)
            );
    }

    // enter amount in wei considering usdt to 6 decimal token
    function convertEthToUsdt(
        uint256 _ethAmount,
        uint256 ethPriceInUSD
    ) internal view returns (uint256) {
        return
            _ethAmount.mul(ethPriceInUSD).mul(tokenDecimals).div(
                ethDecimals.mul(priceFeedDecimals)
            );
    }

    // next buy or sell price
    function nextPrice(
        uint256 _price,
        uint256 _change,
        bool isBuy
    ) internal pure returns (uint256) {
        if (isBuy) {
            return _price + _price.mul(_change).div(100);
        }
        return _price - _price.mul(_change).div(100);
    }

    // Function to deposit fiat into pool
    function openPosition(
        address _token,
        uint256 _tokenAmount,
        uint256 _gridCount,
        uint256 _percentChange
    ) public payable {
        require(_tokenAmount > 0, "Stake amount should be greater than 0.");

        require(_gridCount >= 2, "Grid count must be greater than 3");
        require(_percentChange >= 1, "percent must be greater than 10");

        uint256 ethPriceInUSD = getPriceUsd();
        // buy eth with half of the _tokenAmount, with current eth price
        // uint256 usdtAmountForEth = _tokenAmount.div(2);
        // uint256 remainingUsdt = _tokenAmount - usdtAmountForEth;

        // // deduct fee
        // uint256 usdtAfterFee = usdtAmountForEth.mul(399).div(4).div(100);
        // uint256 orderFee = convertUsdtToEth(
        //     usdtAmountForEth - usdtAfterFee,
        //     ethPriceInUSD
        // );

        // totalFee += orderFee;
        // // totalEthInPool += orderFee;

        // uint256 minEthReceived = convertUsdtToEth(usdtAfterFee, ethPriceInUSD);

        // require(
        //     totalEthInPool > minEthReceived,
        //     "Not enough pool balance to start trade"
        // );

        // IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);

        //temp initialization for testing
        uint256 usdtAfterFee = 50000000;
        uint256 minEthReceived = 500000000000000000;
        // create user position and orders in order book
        Position memory _position = Position({
            user: msg.sender,
            token: _token,
            openAmount: _tokenAmount, // usdt amount user added initially
            price: ethPriceInUSD, // current eth price
            tokenAmount: usdtAfterFee, // current usdt balance
            ethAmount: minEthReceived,
            depositTimeStamp: block.timestamp,
            gridSize: _gridCount, // grid size for the strategy
            percent: _percentChange // percent of price change for each order
        });

        positions.push(_position);
        userPositions[msg.sender] = _position;

        // generate orders based on current eth price  and add it to the priority queue
        //: todo add
        uint256 currentBuyPrice = nextPrice(
            ethPriceInUSD,
            _percentChange,
            true
        );
        uint256 currentSellPrice = nextPrice(
            ethPriceInUSD,
            _percentChange,
            false
        );

        uint256 usdtForBuyOrders = usdtAfterFee.div(_position.gridSize);
        uint256 ethForSellOrders = minEthReceived.div(_position.gridSize);
        address token = _position.token;

        for (uint256 i = 0; i < _gridCount / 2; i++) {
            addBuyOrder(msg.sender, currentBuyPrice, usdtForBuyOrders, token);
            addSellOrder(msg.sender, currentSellPrice, ethForSellOrders, token);

            // update next buy and sell prices for order books
            uint256 _tempBuyPrice = nextPrice(
                currentBuyPrice,
                _position.percent,
                true
            );
            currentBuyPrice = _tempBuyPrice;

            uint256 _tempSellPrice = nextPrice(
                currentSellPrice,
                _position.percent,
                false
            );
            currentSellPrice = _tempSellPrice;
        }

        // update pool global states
        //: todo add
        totalUsdtInPool += usdtAfterFee;
    }
}
