
const mongoose = require("mongoose");
const product = require("./productmodel");
const coupon = require("./couponModel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  isVerified:{
    type:Number,
    default: 0
  },
  isBlocked:{
    type:Number,
    default:0
  },
  offers:[{
    type:mongoose.Types.ObjectId,
    ref:"coupon"
  }],
  discountTotal:{
    type:Number,
    default:0
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice:{
        type:Number
    },
  },
  wishlist:{
    items:[
      {
        productId:{
          type:mongoose.Types.ObjectId,
          ref:"product",
          required: true
        }
      }
    ]
  }
});

userSchema.methods.addToCart = function (product) {
  let cart = this.cart;

  if (cart.items.length === 0) {
    cart.items.push({ productId: product._id, quantity: 1 });
    cart.totalPrice = product.price;
  } else {
    const isExisting = cart.items.findIndex(function (objInItems) {
      return (
        new String(objInItems.productId).trim() ==
        new String(product._id).trim()
      );
    });

    if (isExisting == -1) {

        cart.items.push({ productId: product._id, quantity: 1 });
        cart.totalPrice = cart.totalPrice + product.price;
     
    } else {

        exisitingProductInCart = cart.items[isExisting];
        exisitingProductInCart.quantity += 1;
        cart.totalPrice = cart.totalPrice + product.price;
        // cart.totalPrice += product.price;
      
    }
  }
  return this.save();
};

userSchema.methods.addFromView = function (product,number) {
  let cart = this.cart;

  if (cart.items.length === 0) {
    cart.items.push({ productId: product._id, quantity: number });
    let fullPrice = (product.price * number)
    cart.totalPrice = fullPrice;
  } else {
    const isExisting = cart.items.findIndex(function (objInItems) {
      return (
        new String(objInItems.productId).trim() ==
        new String(product._id).trim()
      );
    });

    if (isExisting == -1) {

        cart.items.push({ productId: product._id, quantity: number});
        let finalPrice = (product.price * number);
        cart.totalPrice = cart.totalPrice + finalPrice;
     
    } else {

        exisitingProductInCart = cart.items[isExisting];
        exisitingProductInCart.quantity += number;
        let cartPrice = (product.price * number)
        cart.totalPrice = cart.totalPrice + cartPrice;
        // cart.totalPrice += product.price;
      
    }
  }
  return this.save();
};

userSchema.methods.removeFromCart = async function(itemData){
  const cart = this.cart;
  const isExisting = cart.items.findIndex(function(objInItems){
    return(
    new String(objInItems.productId).trim()===new String(itemData).trim()
    );
  })
  if(isExisting >= 0 ){
    const prod = await product.findById(itemData);
    cart.totalPrice -= prod.price * cart.items[isExisting].quantity; 
    cart.items.splice(isExisting,1);
    return this.save();
  }
 
}

userSchema.methods.addToWishlist = async function(itemData){
  const wishlist = this.wishlist;
  if(wishlist.items.length === 0){
    wishlist.items.push({productId: itemData._id})
  }
  else{
    const isExisting = wishlist.items.findIndex(function(objInItems){
      return( 
        new String(objInItems.productId).trim()==
        new String(itemData._id).trim()
      )
    })

    if(isExisting == -1){
      wishlist.items.push({productId:itemData._id})
    }
    else{
      let message = "Product already in wishlist"
      return(message);
    }
  }
  return this.save();
}

userSchema.methods.ListRemove = async function(itemData){
  const wishlist = this.wishlist;
  const isExisting = wishlist.items.findIndex(function(objInItems){
    return(
      new String(objInItems.productId).trim() === new String(itemData).trim()
    )
  })
  if(isExisting >=0){
    const prod = await product.findById(itemData);
    wishlist.items.splice(isExisting,1);
    return this.save();
  }

}

userSchema.methods.generateJWT = function(){
  const token = jwt.sign({
    _id:this.id,
    mobile:this.mobile
  },process.env.JWTsecretKey,{expiresIn: "2d"})
}

const User = mongoose.model("User", userSchema);

module.exports = User;
