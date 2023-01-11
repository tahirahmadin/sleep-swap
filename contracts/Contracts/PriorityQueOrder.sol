/**
 * This example creates a smart contract named OrderBook which has two main data structure, 
 * buyOrderBook and sellOrderBook, both are struct PriorityQueue. Each priority queue contains 
 * an array of Order struct, a mapping of price to order index, and a length variable.

The contract has two functions addBuyOrder and addSellOrder that allows users 
to add orders to the respective order book. Each function adds the order to the array, 
assigns the index in the array to the orderIndices mapping and increments the length.

The contract also has a function filterOrdersByPrice that takes in a boolean value 
indicating whether to filter the buy order book or the sell order book, and a price value. 
This function iterates through the selected order book, and filters the orders by the given price
 */

pragma solidity ^0.8.0;

contract OrderBook {
    struct Order {
        address owner;
        uint256 price;
        uint256 quantity;
    }

    struct PriorityQueue {
        Order[] orders;
        mapping(uint256 => uint256) orderIndices;
        uint256 length;
    }

    PriorityQueue buyOrderBook;
    PriorityQueue sellOrderBook;

    function addBuyOrder(uint256 _price, uint256 _quantity) public {
        Order memory newOrder = Order({
            owner: msg.sender,
            price: _price,
            quantity: _quantity
        });

        buyOrderBook.orders.push(newOrder);
        buyOrderBook.orderIndices[_price] = buyOrderBook.length;
        buyOrderBook.length++;
    }

    function addSellOrder(uint256 _price, uint256 _quantity) public {
        Order memory newOrder = Order({
            owner: msg.sender,
            price: _price,
            quantity: _quantity
        });

        sellOrderBook.orders.push(newOrder);
        sellOrderBook.orderIndices[_price] = sellOrderBook.length;
        sellOrderBook.length++;
    }

    function filterOrdersByPrice(
        bool _buy,
        uint256 _price
    ) public view returns (Order[] memory) {
        PriorityQueue memory book = _buy ? buyOrderBook : sellOrderBook;
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
}
