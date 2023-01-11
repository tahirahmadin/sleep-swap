/**
 * 
structure called a balanced binary search tree. This data structure allows for efficient insertion, 
removal, and searching of elements, and is well-suited for maintaining an ordered list of items, 
such as limit orders in an exchange.
 */

pragma solidity ^0.8.0;

contract OrderBook {
    struct OrderNode {
        address owner;
        uint256 price;
        uint256 quantity;
        OrderNode left;
        OrderNode right;
    }

    OrderNode public root;

    function insertOrder(
        address _owner,
        uint256 _price,
        uint256 _quantity
    ) public {
        root = insert(root, _owner, _price, _quantity);
    }

    function removeOrder(address _owner, uint256 _price) public {
        root = remove(root, _owner, _price);
    }

    function getOrdersByPriceRange(
        uint256 _minPrice,
        uint256 _maxPrice
    )
        public
        view
        returns (
            address[] memory owners,
            uint256[] memory prices,
            uint256[] memory quantities
        )
    {
        (owners, prices, quantities) = getOrdersInRange(
            root,
            _minPrice,
            _maxPrice
        );
    }

    function insert(
        OrderNode memory node,
        address _owner,
        uint256 _price,
        uint256 _quantity
    ) internal returns (OrderNode memory) {
        if (node == address(0)) {
            return
                OrderNode({
                    owner: _owner,
                    price: _price,
                    quantity: _quantity,
                    left: address(0),
                    right: address(0)
                });
        }
        if (_price <= node.price) {
            node.left = insert(node.left, _owner, _price, _quantity);
        } else {
            node.right = insert(node.right, _owner, _price, _quantity);
        }
        return node;
    }

    function remove(
        OrderNode memory node,
        address _owner,
        uint256 _price
    ) internal returns (OrderNode memory) {
        if (node == address(0)) {
            return node;
        }
        if (_price < node.price) {
            node.left = remove(node.left, _owner, _price);
        } else if (_price > node.price) {
            node.right = remove(node.right, _owner, _price);
        } else if (node.left == address(0)) {
            return node.right;
        } else if (node.right == address(0)) {
            return node.left;
        } else {
            OrderNode memory minNode = findMinNode(node.right);
            node.owner = minNode.owner;
            node.price = minNode.price;
            node.quantity = minNode.quantity;
            node.right = remove(node.right, minNode.owner, minNode.price);
        }
        return node;
    }

    function findMinNode(
        OrderNode memory node
    ) internal view returns (OrderNode memory) {
        if (node.left == address(0)) {
            return node;
        } else {
            return findMinNode(node.left);
        }
    }
}
