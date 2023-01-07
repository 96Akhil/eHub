const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    type:{
        type: String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    isBlocked:{
        type:Number,
        default:0
    },
    usedBy:[{
        type:mongoose.Types.ObjectId,
        ref: 'User'
    }]
})

const Coupons = mongoose.model('Coupon',couponSchema);

module.exports = Coupons;