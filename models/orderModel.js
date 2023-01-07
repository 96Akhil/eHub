const mongoose = require('mongoose');
const User = require("../models/userModel");
const Product = require("../models/productmodel");

const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    payment:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    // state:{
    //     type:String,
    //     required:true
    // },
    zip:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
    },
    isAttempted:{
        type:Number,
        default:1
    },
    isDelivered:{
        type:Number,
        default:0
    },
    isCancelled:{
        type:Number,
        default:0
    },
    isReturned:{
        type:Number,
        default:0
    },  
    products:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:"product"
            },
            quantity:{
                type:Number,
            }
        }],
        totalPrice:{
            type:Number,
            deafult:0
        }
    },
    productReturned:[{
        type:Number,
    }],
    status:{
        type:String,
        default:"Attempted"
    },
    offer:{
        type:String,
        default:"None"
    }
})

const Order = mongoose.model("Order",orderSchema);

module.exports = Order;