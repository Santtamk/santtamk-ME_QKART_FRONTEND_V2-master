import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";



// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 *
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */

export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData || !productsData) {
    return [];
  }
  return cartData.map((cartItem) => {
    const { productId, qty } = cartItem;
  const product = productsData.find((p) => p._id === productId);

    if (product) {
      const { name, category, cost, rating, image, _id } = product;
      return {
        name,
        category,
        cost,
        rating,
        image,
        _id,
        qty: cartItem.qty,
      };
    }
    return null;
  }).filter((cartItem) => cartItem !== null);
};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  return items.reduce((total, item) => total + item.cost * item.qty, 0);
};

/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 *
 * @param {Number} value
 *    Current quantity of product in cart
 *
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 *
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 *
 *
 */
const ItemQuantity = ({ value, handleAdd, handleDelete }) => {
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

/**
 * Component to display the Cart view
 *
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 *
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 *
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 *
 *
 *
 *
 */
const getTotalItems = (items) => {
  return items.reduce((total, item) => {
    return total + item.qty;
  }, 0)
}

export const handleQuantity = (productId, quantity, setItems, items) => {
  const updatedItems = items.map((item) => {
    if (item.productId === productId) {
      return { ...item, qty: quantity };
    }
    return item;
  });

  setItems(updatedItems);
};

const Cart = ({ products, items = [], handleQuantity }) => {
  console.log("Items prop:", items);

  const history = useHistory();


  

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }
  
  console.log("generatecart:", generateCartItemsFrom(items, products));
  if(history.location.pathname === '/checkout'){

    return (
      <>
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        {items.map((product) => {
          return (
            <Box key={product._id} display="flex" alignItems="flex-start" padding="1rem">
              <Box className="image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="6rem"
                paddingX="1rem"
              >
                <div>{product.name}</div>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                 <Box>
                    Qty:{product.qty}
                  </Box>
                  <Box padding="0.5rem" fontWeight="700">
                    ${product.cost}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>
      </Box>
    <Box className="cart" 
    color="#3C3C3C" alignSelf="center"  padding="1rem">
      <Box 
          color="#3C3C3C"
          fontWeight="700"
          fontSize="1.5rem"
          alignSelf="center">Order details</Box>
      <Box paddingTop="1rem" display="flex" justifyContent="space-between"><span>Products</span><span>{getTotalItems(items)}</span></Box>
      <Box paddingTop="1rem" display="flex" justifyContent="space-between"><span>Subtotal</span><span>${getTotalCartValue(items)}</span></Box>
      <Box paddingTop="1rem" display="flex" justifyContent="space-between"><span>Shipping Charges</span><span>$0</span></Box>
      <Box paddingTop="1rem" fontWeight="700"
          fontSize="1rem" display="flex" justifyContent="space-between"><span>Total</span><span>${getTotalCartValue(items)}</span></Box>
    </Box>
    </>

    )
  }
  
  return (
    <>
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        {items.map((product) => {
          return (
            <Box key={product._id} display="flex" alignItems="flex-start" padding="1rem">
              <Box className="image-container">
                <img
                
                  src={product.image}
                  
                  alt={product.name}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="6rem"
                paddingX="1rem"
              >
                <div>{product.name}</div>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <ItemQuantity
                    value={product.qty}
                    handleAdd={() =>
                      handleQuantity(product._id, product.qty + 1)
                    }
                    handleDelete={() =>
                      handleQuantity(product._id, product.qty - 1)
                    }
                  />
                  <Box padding="0.5rem" fontWeight="700">
                    ${product.cost}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" className="cart-footer">
          <Button
            color="primary"
            variant="contained"
            startIcon={<ShoppingCart />}
            className="checkout-btn"
            onClick={() => {
              history.push('/checkout')
            }}
          >
            Checkout
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Cart;
