pragma solidity ^0.8.0;

/**
 * 
This example creates a smart contract named OrderBook which has two main data structure, buyOrderBook 
and sellOrderBook, both are struct Order type, which contains an owner, a price, a quantity, and two 
pointers for the next and previous orders in the order book.
The contract also has two functions addBuyOrder and addSellOrder to add buy and sell order respectively.
It also has a function fillOrder which is used to fill orders.
 */
contract OrderBook {
    struct Order {
        address owner;
        uint256 price;
        uint256 quantity;
        Order next;
        Order prev;
    }

    Order buyOrderBook;
    Order sellOrderBook;

    function addBuyOrder(uint256 _price, uint256 _quantity) public {
        Order memory newOrder = Order({
            owner: msg.sender,
            price: _price,
            quantity: _quantity,
            next: buyOrderBook,
            prev: address(0)
        });
        if (buyOrderBook.prev != address(0)) {
            buyOrderBook.prev.next = newOrder;
        }
        buyOrderBook.prev = newOrder;
        buyOrderBook = newOrder;
    }

    function addSellOrder(uint256 _price, uint256 _quantity) public {
        Order memory newOrder = Order({
            owner: msg.sender,
            price: _price,
            quantity: _quantity,
            next: sellOrderBook,
            prev: address(0)
        });
        if (sellOrderBook.prev != address(0)) {
            sellOrderBook.prev.next = newOrder;
        }
        sellOrderBook.prev = newOrder;
        sellOrderBook = newOrder;
    }

    function fillOrder(Order memory order, uint256 _quantity) internal {
        if (order.quantity <= _quantity) {
            if (order.prev != address(0)) {
                order.prev.next = order.next;
            }
            if (order.next != address(0)) {
                order.next.prev = order.prev;
            }
        } else {
            order.quantity -= _quantity;
        }
    }
}
