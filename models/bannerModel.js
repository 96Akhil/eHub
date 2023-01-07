const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    isActive:{
        type:Number,
        default:0
    }
})

const banner = mongoose.model("banner",bannerSchema);

module.exports = banner;