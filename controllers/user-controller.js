const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Product = require("../models/productmodel");
var objectId = require("mongodb").ObjectId;
const Category = require("../models/categoryModel");
const fast2sms = require("fast-two-sms");
const Coupons = require("../models/couponModel");
const flash = require("express-flash");
const Order = require("../models/orderModel");
const Razorpay = require("razorpay");
const Banner = require("../models/bannerModel");

let NewUser;
let NewOtp;
let CouponName;
let totalAmount;
let currentOrder;

const securePassword = async function (password) {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const sendOTP = function (mobile, res) {
  let randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    // authorization: "MbPtXOSEhTAL7Ilm2HxCweFJdG8nYqZo0QBjpcvf3aWKRN5UDr1reAk2MZ36vYSf4szN0tE5dpWQ7PKx",
    authorization:'MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq',
    message: `your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };
  //send this message
  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("otp sent succcessfully");
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};

const loadUser = async function (req, res, next) {
  try {
    let user = req.session.user;
    await Banner.findOne({isActive:1}).lean().exec(async function(err,bannerData){
      console.log(bannerData);
      let bannerImage = bannerData.image;
      if(bannerData){
        const categoryData = await Category.find({})
        .lean()
        .exec(async function (err, categoryDisplay) {
          if (categoryDisplay) {
            const userProducts = await Product.find({ isDeleted: 0 })
              .lean()
              .exec(function (err, productDisplay) {
                if (productDisplay) {
                  res.render("user", {
                    products: productDisplay,
                    admin: false,
                    user,
                    categoryDisplay,
                    bannerImage
                });
              }
           });
          }
        });
      }
    })

  } catch (error) {
    console.log(error.message);
  }
};

// const loadUser = async function(req,res){
//   try {
//     res.render("user")
//   } catch (error) {
//     console.log(error.message)
//   }
// }

const userSignup = function (req, res) {
  try {
    res.render("user/usersignup");
  } catch (error) {
    console.log(error.message);
  }
};

const userSignupData = async function (req, res) {
  try {
    const emailCheck = req.body.email;

    const emailID = await User.findOne({ email: emailCheck });

    if (emailID) {
      res.render("user/usersignup", {
        message: "User already exists!",
      });
    } else {
      const Spassword = await securePassword(req.body.password);

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.phone,
        password: Spassword,
        is_admin: 0,
      });

      const userData = await user.save();
      NewUser = userData._id;
      if (userData) {
        res.redirect("/verifyOtp");
        // res.render("user/usersignup", {
        //   message: "Registration is successfull!",
        // });
      } else {
        res.render("user/usersignup", {
          message: "Registration is unsuccessfull!",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyUser = async function (req, res) {
  try {
    function checkLogin(data) {
      return new Promise(async function (resolve, reject) {
        let loginStatus = false;
        let response = {};
        let user = await User.findOne({ email: data.email });
        if (user.isBlocked) {
          res.render("user/userLogin", {
            usermessage: "The user has been blocked!",
          });
        } else {
          if (user) {
            bcrypt
              .compare(data.password, user.password)
              .then(function (status) {
                if (status) {
                  response.user = user;
                  response.status = true;
                  resolve(response);
                } else {
                  resolve({ status: false });
                }
              });
          } else {
            resolve({ status: false });
          }
        }
        console.log(user);
      });
    }

    let userData = {
      email: req.body.email,
      password: req.body.password,
    };

    checkLogin(userData).then(function (response) {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.redirect("/");
      } else {
        res.render("user/userLogin", {
          usermessage: "Please check the login credentials",
        });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const userLogin = async function (req, res) {
  try {
    if (req.session.loggedIn) {
      console.log(req.session.loggedIn);
      res.redirect("/");
    } else {
      res.render("user/userLogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async function (req, res) {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const userCart = async function (req, res, next) {
  try {
    let data = req.session.user._id;
    let user = req.session.user;

    await User.findOne({ _id: objectId(data) }).exec(async function (
      err,
      userData
    ) {
      let userCart = await userData.populate("cart.items.productId");
      let cartItems = userCart.cart.items.map((item) => {
        let { quantity, productId } = item;

        let { name, price, category, image, description, _id } = productId;
        return { name, price, category, image, description, quantity, _id };
      });
      let finalPrice = userCart.cart.totalPrice;
      let updatedPrice = userCart.discountTotal;
      console.log(finalPrice);
      res.render("user/cart", {
        cartItems,
        user,
        price: finalPrice,
        updatedPrice,
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const productLoad = async function (req, res) {
  try {
    let user = req.session.user;
    let data = req.params.id;
    let loadProducts = await Product.find({ _id: objectId(data) })
      .lean()
      .exec(function (err, viewProducts) {
        if (viewProducts) {
          res.render("user/productView", { products: viewProducts, user });
        }
      });
  } catch (error) {
    console.log(error.message);
  }
};

const producttoCart = async function (req, res) {
  try {
    let data = req.params.id;
    let cartProducts = await Product.findOne({ _id: objectId(data) });
    let cartUpdate = await User.findById({ _id: req.session.user._id }).exec(
      async function (err, userData) {
        await userData.addToCart(cartProducts);
        req.flash("success", "Product has been added to wishlist!");
        res.redirect("/");
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

const cartDelete = async function (req, res) {
  try {
    let itemData = req.params.id;
    console.log(itemData);
    let data = req.session.user._id;
    await User.findOne({ _id: objectId(data) }).exec(function (err, userData) {
      console.log(userData);
      userData
        .removeFromCart(itemData)
        .then(function () {
          res.redirect("/cart");
        })
        .catch(function (error) {
          console.log(error.message);
        });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const producttoList = async function (req, res) {
  try {
    let userData = req.session.user._id;
    let productData = req.params.id;
    let listProducts = await Product.findOne({ _id: objectId(productData) });
    await User.findById({ _id: req.session.user._id }).exec(async function (
      err,
      listData
    ) {
      await listData.addToWishlist(listProducts);
      req.flash("success", "Product has been added to your Wishlist!");
      res.redirect("/");
    });
  } catch (error) {
    console.log(error.message);
  }
};

const userWishlist = async function (req, res) {
  try {
    let user = req.session.user;
    let data = req.session.user._id;
    await User.findOne({ _id: objectId(data) }).exec(async function (
      err,
      userData
    ) {
      let listData = await userData.populate("wishlist.items.productId");
      let userList = listData.wishlist.items.map(function (item) {
        let { productId } = item;
        let { name, price, image, description, _id } = productId;
        return { name, price, image, description, _id };
      });
      res.render("user/wishList", { user, userList });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const wishListToCart = async function (req, res) {
  try {
    let data = req.params.id;
    let cartProducts = await Product.findOne({ _id: objectId(data) });
    await User.findById({ _id: req.session.user._id }).exec(async function (
      err,
      userData
    ) {
      await userData.addToCart(cartProducts);
      await userData.ListRemove(cartProducts).then(async function () {
        res.redirect("/wishList");
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const WishlistDelete = async function (req, res) {
  try {
    let data = req.params.id;
    let userId = req.session.user._id;
    await User.findById({ _id: objectId(userId) }).exec(async function (
      err,
      userData
    ) {
      console.log(userData);
      userData.ListRemove(data).then(function () {
        res.redirect("/wishList");
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

const ProductViewToCart = async function (req, res) {
  try {
    let data = req.body.prodId;
    let number = req.body.quantity;
    console.log(number);
    console.log(data);

    let cartProducts = await Product.findOne({ _id: objectId(data) });
    let cartUpdate = await User.findById({ _id: req.session.user._id }).exec(
      async function (err, userData) {
        await userData.addFromView(cartProducts,number);
        res.redirect("/cart");
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

const ProductViewToList = async function (req, res) {
  try {
    let userData = req.session.user._id;
    let productData = req.params.id;
    let listProducts = await Product.findOne({ _id: objectId(productData) });
    await User.findById({ _id: req.session.user._id }).exec(async function (
      err,
      listData
    ) {
      await listData.addToWishlist(listProducts);
      res.redirect("/wishList");
    });
  } catch (error) {
    console.log(error.message);
  }
};

const FilterCategory = async function (req, res) {
  try {
    user = req.session.user;
    categoryId = req.params.id;
    await Category.findOne({ _id: objectId(categoryId) })
      .lean()
      .exec(async function (err, categoryName) {
        let name = categoryName.name;
        await Product.find({ category: name })
          .lean()
          .exec(async function (err, categoryProduct) {
            console.log(categoryProduct);
            console.log(name);
            console.log(user);
            res.render("user/filterView", {
              products: categoryProduct,
              user,
              name,
            });
          });
      });
  } catch (error) {
    console.log(error.message);
  }
};

const OtpPage = async function (req, res) {
  try {
    let userData = await User.findById({ _id: NewUser });
    console.log(userData);
    let otp = sendOTP(userData.mobile, res);
    NewOtp = otp;
    res.render("user/verifyOtp", { user: userData._id, otp: otp });
  } catch (error) {
    console.log(error.message);
  }
};

const OtpVerify = async function (req, res) {
  try {
    let checkOtp = NewOtp;
    let userId = req.body.user;
    let getOtp = req.body.otp;
    console.log(userId);
    console.log(getOtp);
    let userData = await User.findById({ _id: objectId(userId) });
    if (checkOtp == getOtp) {
      userData.isVerified = 1;
      let user = await userData.save();
      if (user) {
        res.redirect("/login");
      }
    } else {
      res.render("user/verifyOtp", { message: "OTP is Invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const discountCoupon = async function (req, res) {
  let user = req.session.user;
  let discount = req.body.discount;
  console.log(discount);
  let userData = await User.findOne({ _id: objectId(user._id) });
  console.log(userData);
  let coupons = await Coupons.findOne({ name: discount });
  CouponName = coupons.name;
  console.log(coupons);
  if (coupons) {
    console.log(coupons._id);
    let couponCheck = await userData.offers.includes(coupons._id);
    console.log(couponCheck);

    if (couponCheck || coupons.isBlocked) {
      let userCart = await userData.populate("cart.items.productId");
      let cartItems = userCart.cart.items.map((item) => {
        let { quantity, productId } = item;

        let { name, price, category, image, description, _id } = productId;
        return { name, price, category, image, description, quantity, _id };
      });
      let finalPrice = userCart.cart.totalPrice;
      let updatedPrice = userCart.discountTotal;
      console.log(finalPrice);
      res.render("user/cart", {
        cartItems,
        user,
        price: finalPrice,
        updatedPrice,
        useMessage: "Coupon has been already used or it has expired!",
      });
    } else {
      let updatedTotal =
        userData.cart.totalPrice -
        (userData.cart.totalPrice * coupons.discount) / 100;
      console.log(updatedTotal);
      userData.discountTotal = updatedTotal;
      // await userData.offers.push(coupons._id);
      let updatedUser = await userData.save();
      console.log(updatedUser.discountTotal);
      console.log(updatedUser);
      // await coupons.usedBy.push(userData._id);
      // await coupons.save();
      console.log(coupons);
      if (updatedUser) {
        res.redirect("/cart");
      }
    }
  } else {
    let userCart = await userData.populate("cart.items.productId");
    let cartItems = userCart.cart.items.map((item) => {
      let { quantity, productId } = item;

      let { name, price, category, image, description, _id } = productId;
      return { name, price, category, image, description, quantity, _id };
    });
    let finalPrice = userCart.cart.totalPrice;
    let updatedPrice = userCart.discountTotal;
    console.log(finalPrice);
    res.render("user/cart", {
      cartItems,
      user,
      price: finalPrice,
      updatedPrice,
      useMessage: "Invalid coupon code!",
    });
  }
};

const loadCheckout = async function (req, res) {
  try {
    let user = req.session.user;
    let userId = req.session.user._id;
    let userData = await User.findById({ _id: objectId(userId) });
    console.log(userData.discountTotal);
    let discountPrice = userData.discountTotal;
    res.render("user/checkOut", { user, discountPrice, cart: userData.cart });
  } catch (error) {
    console.log(error.message);
  }
};

const checkoutSuccess = async function (req, res) {
  try {
    let user = req.session.user;
    let userId = req.session.user._id;
    let userData = await User.findById({ _id: objectId(userId) });
    let completeData = await userData.populate("cart.items.productId");
    console.log(completeData.cart);
    let offerCode = CouponName;
    
    let FinalPrice;
    if (userData.discountTotal > 0) {
      FinalPrice = userData.discountTotal;
      userData.cart.totalPrice = userData.discountTotal;
      userData.discountTotal = 0;
      let updatedUser = await userData.save();

      let coupons = await Coupons.findOne({ name: offerCode });

      await userData.offers.push(coupons._id);
      await userData.save();

      await coupons.usedBy.push(userData._id);
      await coupons.save();

    } else {
      FinalPrice = userData.cart.totalPrice;
    }
    if (FinalPrice) {
      const order = new Order({
        userId: userData._id,
        userName: req.body.name,
        amount: FinalPrice,
        payment: req.body.payment,
        country: req.body.country,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        products: completeData.cart,
        offer: offerCode,
      });

      order.products.item.push(...completeData.cart.items);

      let orderProductStatus = [];
      for (let key of order.products.item) {
        orderProductStatus.push(0);
      }
      order.productReturned = orderProductStatus;
      const orderData = await order.save();

      totalAmount = FinalPrice;

      if (req.body.payment == "Cash-on-Delivery") {
        console.log("Success");
        res.redirect("/orderSuccess");
      } else if (req.body.payment == "RazorPay") {
        let payment = res.render("user/razorPay", {userId:userData._id,total:FinalPrice});
        if(payment){
          res.redirect("/orderSuccess");
        }
      }
    }

    // First checking if the user has applied a coupon or not, if yes then assigning that amount to totalPrice
  } catch (error) {
    console.log(error.message);
  }
};

const razorpayCheckout = async function(req,res){
  let user = req.session.user;
  let checkoutAmount = totalAmount;
  let userData = await User.findById({_id:objectId(user._id)});
  let instance = new Razorpay({ key_id: 'rzp_test_BOSvj6HZnYRLeU', key_secret: 'zk5NpkLNoSFOcM8FhK2fKhis' })
  let order = await instance.orders.create({
    amount: checkoutAmount*100,
    currency: "INR",
    receipt: "receipt#1",
  })
  res.status(201).json({
      success: true,
      order,
      user
  })
  
}

const orderPlaced = async function(req,res){
  try {
    let user = req.session.user;
    console.log(user);
    if(user){
      let userData = await User.findById({_id:objectId(user._id)});
      let productData = await Product.find();
      for(let key of userData.cart.items){
        for(let prod of productData){
          if(new String(prod._id).trim()==new String(key.productId).trim()){
            prod.quantity = prod.quantity - key.quantity;
            await prod.save()
          }
        }
      }
      await User.updateOne({_id:user._id},{$set:{'cart.items':[],'cart.totalPrice':'0'}},{multi:true})
    }
    res.render("user/orderSuccess",{user});
  } catch (error) {
    console.log(error.message)
  }
}

const orderList = async function(req,res){
  try {
    let user = req.session.user;
    let userId = req.session.user._id;
    let orders = await Order.find({userId:userId}).lean().exec(function(err,orderData){
      if(orderData){
        console.log(orderData);
        res.render("user/orders",{user,orderData});
      }
    })
    
    console.log(orderData);
  } catch (error) {
    console.log(error.message)
  }
}

const orderDetails = async function(req,res){
  try {
    let user = req.session.user;
    let orderId = req.params.id;
    currentOrder = orderId;
    await Order.findOne({_id:objectId(orderId)}).exec(async function(err,orderData){
      console.log(orderData);
      let orderItems = await orderData.populate("products.item.productId");
      let productData = orderItems.products.item.map((item)=>{
        let{quantity,productId}= item;
        let { name, price, category, image, description, _id } = productId;
        return { name, price, category, image, description, quantity, _id };
      })
      console.log(orderItems);
      await Order.findOne({_id:objectId(orderId)}).lean().exec(async function(err,orderDetails){
        let orderStatus = orderDetails.status;
        console.log(orderDetails.status)
        res.render("user/orderView",{
          productData,
          user,
          orderDetails,
          orderStatus
        })

      })
      
    })
  } catch (error) {
    console.log(error.message);
  }
}

const orderReturn = async function(req,res){
  try {
    let user = req.session.user;
    let prodId = req.params.id;
    let orderId = currentOrder;

    const productOrderData = await Order.findById({_id:objectId(orderId)});
    const productItems = await Product.findById({_id:objectId(prodId)});

    if(productOrderData.isAttempted || productOrderData.isCancelled || productOrderData.isReturned){
      await Order.findOne({_id:objectId(orderId)}).exec(async function(err,orderData){
        console.log(orderData);
        let orderItems = await orderData.populate("products.item.productId");
        let productData = orderItems.products.item.map((item)=>{
          let{quantity,productId}= item;
          let { name, price, category, image, description, _id } = productId;
          return { name, price, category, image, description, quantity, _id };
        })
        console.log(orderItems);
        await Order.findOne({_id:objectId(orderId)}).lean().exec(async function(err,orderDetails){
          let orderStatus = orderDetails.status;
          console.log(orderDetails.status)
          let returnMessage = "Order status should be delivered to process further"
          res.render("user/orderView",{
            productData,
            user,
            orderDetails,
            orderStatus,
            returnMessage
          })
  
        })
        
      })
    }
    else if(productOrderData.status == "Delivered"){
      for(let i=0;i<productOrderData.products.item.length;i++){
        if(new String(productOrderData.products.item[i].productId).trim() === new String(prodId).trim()){
            productItems.quantity += productOrderData.products.item[i].quantity
            productOrderData.productReturned[i] = 1
            console.log('found!!!');
            console.log('productData.stock',productItems.quantity);
            await productItems.save().then(()=>{
                console.log('productData saved');
            })
            console.log('productOrderData.productReturned[i]',productOrderData.productReturned[i]);
            productOrderData.isReturned = 1;
            productOrderData.status = "Returned"
            await productOrderData.save().then(()=>{
                console.log('productOrderData saved');
                res.redirect("/orders");
            })
            
        }else{
            // console.log('Not at position: ',i);
        }
    }
    }

  } catch (error) {
    console.log(error.message);
  }
}


const orderCancel = async function(req,res){
  try {
    let orderId = req.params.id;
    let orderList = await Order.findByIdAndUpdate({_id:objectId(orderId)},{$set:{isCancelled:1,isAttempted:0,status:"Cancelled"}});
    console.log(orderList);
    // let orderList =await Order.save();
    if(orderList){
      res.redirect("/orders");
    }

  } catch (error) {
    console.log(error.message)
  }
}

// const notFound = async function(req,res){
//   res.render("/404");
// }

module.exports = {
  loadUser,
  userSignup,
  userSignupData,
  userLogin,
  verifyUser,
  userLogout,
  userCart,
  productLoad,
  producttoCart,
  cartDelete,
  producttoList,
  userWishlist,
  wishListToCart,
  WishlistDelete,
  ProductViewToCart,
  ProductViewToList,
  FilterCategory,
  OtpPage,
  OtpVerify,
  discountCoupon,
  loadCheckout,
  checkoutSuccess,
  razorpayCheckout,
  orderPlaced,
  orderList,
  orderDetails,
  orderReturn,
  orderCancel,
  // notFound
};
