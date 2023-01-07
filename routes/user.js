var express = require("express");
var router = express.Router();
var userController = require("../controllers/user-controller")
const auth = require('../middleware/auth');


router.get("/",userController.loadUser);

router.get("/signup",userController.userSignup);

router.post("/signup",userController.userSignupData);

router.get("/login",userController.userLogin);

router.post("/login",userController.verifyUser);

router.get("/logout",userController.userLogout);

router.get("/cart",auth.isLogin,userController.userCart);

router.get("/addtoCart/:id",auth.isLogin,userController.producttoCart);

router.get("/productView/:id",userController.productLoad);

router.get("/deleteCart/:id",userController.cartDelete);

router.get("/addtoList/:id",auth.isLogin,userController.producttoList);

router.get("/wishList",auth.isLogin,userController.userWishlist);

router.get("/listToCart/:id",userController.wishListToCart);

router.get("/ListDelete/:id",userController.WishlistDelete);

router.post("/productToCart",userController.ProductViewToCart);

router.get("/productToList/:id",userController.ProductViewToList);

router.get("/verifyOtp",userController.OtpPage);

router.post("/verifyOtp",userController.OtpVerify);

router.post("/addCoupon",userController.discountCoupon);

router.get("/categoryFilter/:id",userController.FilterCategory);

router.get("/checkOut",userController.loadCheckout);

router.post("/checkOut",userController.checkoutSuccess);

router.post("/razorPay",userController.razorpayCheckout);

router.get("/orderSuccess",auth.isLogin,userController.orderPlaced);

router.get("/orders",userController.orderList);

router.get("/viewOrder/:id",userController.orderDetails);

router.get("/returnProduct/:id",userController.orderReturn);

router.get("/cancelOrder/:id",userController.orderCancel);

// router.get("*",userController.notFound);

/*here the defined router has been exported so it can be required and used in index.js
file*/
module.exports = router;
