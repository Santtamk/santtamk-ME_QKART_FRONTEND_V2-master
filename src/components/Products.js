import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart from "./Cart"
import { generateCartItemsFrom, handleQuantity } from './Cart';


  

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


const Products = () => {

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const {enqueueSnackbar} = useSnackbar()
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const isLoggedIn = !!localStorage.getItem("token");
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem('token');
  // console.log("cartgenerated:", cartItems);
  
  

  const performAPICall = async (token) => {
    setIsLoading(true);
    try{
      const response = await axios.get(`${config.endpoint}/products`)
      console.log("performAPICall:", response.data);

      if (response.status === 200) {
        const productsData = response.data;
        setIsLoading(false);
        setProductsData(productsData);
        // setProducts(productsData);

        try {
          let items = await fetchCart(token);
          console.log("fetchcart items:", items);
          // if(token)
            setItems(generateCartItemsFrom(response.data, productsData))
          setFilteredProducts(productsData);
        } catch (error) {
          console.error("Error fetchCart items:", error);
        }
      }
      }catch(error){
      setIsLoading(false);
      if (error.response && error.response.status === 500){
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      return null;
    } else {
      enqueueSnackbar(
        "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      )
    }
  };
}

useEffect(() => {
  performAPICall(token)
}, []);

 
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try{
      const response = await axios.get(`${config.endpoint}/products/search?value=${text}`)
      setFilteredProducts(response.data);
    }catch(error){
      if(error.response){
        if(error.response.status === 404){
          setFilteredProducts([])
        }
        if(error.response.status === 500) {
          enqueueSnackbar(error.response.data.message, { variant: "error"});
          setFilteredProducts(products);
        }
      }else{
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.", 
          {
            varient: "error",
          }
        )
      }

    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event) => {
    if(debounceTimeout){
      clearTimeout(debounceTimeout);
    }
    const text = event.target.value;
    const timeout = setTimeout(() => {
      performSearch(text);
    }, 500);
    setDebounceTimeout(timeout);
  };
  
  /**
 * @param {Array.<{ productId: String, qty: Number }>} cartData 
 */

 
    useEffect(() => {
      if (cartData && productsData) {
        const productsArray = productsData.map((product) => ({
          ...product,
          qty: cartData.find((item) => item.productId === product._id)?.qty || 0,
        }));
        const cartItems = generateCartItemsFrom(cartData, productsArray);
        setCartItems(cartItems);
        console.log("cartItems:", cartItems);
      }
    }, [cartData, productsData]);

    const fetchCart = async () => {
      if(!token) return[];
        try{
          const response = await axios.get(`${config.endpoint}/cart`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          console.log('fetchCart response::', response.data, response.status);
          if(response.status === 200){
            const cartData = response.data;
            console.log('cart data:', cartData);
            setCartData(cartData);
            setCartItems(cartData);
            return cartData;
          }
        }catch(error){
          console.error('Error fetching cart:', error);
          }
        }
      
        useEffect(() => {
          fetchCart().then((cartData) => {
            setCartData(cartData);
            setCartItems(generateCartItemsFrom(cartData, productsData));
          });
        }, [productsData]);

  const isItemInCart = (cartItems, productId) => {
    
    const isittrue = cartItems.some((item) => item._id === productId);
    console.log(cartItems._id, productId)
    console.log(isittrue);
    return isittrue
  };


    const addToCart = async(
      token, 
      items,
      products,
      productId,
      qty,
      options = { preventDuplicate: false}
    ) => {
      if(!isLoggedIn){
        enqueueSnackbar(
          "Login to add an item to the Cart",
          {
            variant: "warning",
          })
          return;
      }
       if(options.preventDuplicate && isItemInCart(items, productId)){
        console.log("checkkkk")
          enqueueSnackbar(
            "Item already in cart. Use the cart sidebar to update quantity or remove item.",
            {
              variant: "warning",
            })
            return;

      }
      try{ 
        
        let response = await axios.post(`${config.endpoint}/cart`, {
          productId,
          qty
        }, {
          headers:{
            Authorization: `Bearer ${token}`,
          }
        })
        if(response.status === 200){
          console.log("addToCart:", response.data)
          setCartItems(generateCartItemsFrom(response.data, productsData));
          // enqueueSnackbar(
          //   "Item added to cart.",
          //   {
          //     variant: "success",
          //   })
          return response.data;
        } 
        
      }catch(error){
        console.error("addToCart:", error )
      }
    };

    
    
   
console.log("cartItems:", cartItems);
  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            )
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, debounceTimeout)}
        />

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={debounceSearch}
      />
       <Grid container>
          <Grid item className="product-grid" md sm>
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span> to your door step
              </p>
            </Box>
            {isLoading ? (
              <Box className="loading">
                <CircularProgress />
                <h4>Loading Products</h4>
              </Box>
            ) : (
              <Grid container marginY="1rem" paddingX="1rem" spacing={2}>
                {filteredProducts.length ? (
                  filteredProducts.map((product) => (
                    
                      <Grid item xs={6} md={3} key={product._id}>
                        <ProductCard
                        items={cartItems}
                          product={product}
                          handleAddToCart={(productId, qty) => {
                            addToCart (
					                    token, 
                              cartItems,
                              products,
                              productId,
                              qty,
                              { preventDuplicate: true }
                            )
                          }}
                        />
                      </Grid>
                  ))
                ) : (
                    <Box className="loading">
                      <SentimentDissatisfied color="action" />
                      <h4 style={{ color: "#636363" }}>No products found</h4>
                    </Box>
                )}
              </Grid>
            )}
          </Grid>
          {isLoggedIn &&
          (
          <Grid item className="cartbackground" md={3} sm={12}>
             <Cart items={cartItems} 
             products={products} 
             handleQuantity = {(productId, qty) => 
            addToCart(token,
            items,
            products,
            productId,
            qty,
            {preventDuplicate: true})}
            />
          </Grid> 
          )}
           
       </Grid>
      <Footer />
    </div>
  );
        }


export default Products;

