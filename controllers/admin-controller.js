const Product = require("../models/productmodel");
const Users = require("../models/userModel");
var objectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel");
// const User = require("../models/userModel");
const Coupons = require("../models/couponModel");
const Order = require("../models/orderModel");
const Banner = require("../models/bannerModel");
const excelJs = require("exceljs");

const loadAdmin = function (req, res) {
  try {
    res.render("admin/adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyAdmin = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await Users.findOne({ email: email });
    console.log("hello")
    if(userData.is_admin===0){
      console.log("login")
      res.render("admin/adminLogin", { adminmessage: "Not valid credentials for Admin" });
    }
    else{
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if(passwordMatch){
          req.session.admin = userData;
          req.session.admin_id = userData._id;
          res.redirect("admin/adminHome");
      }
      else{
        res.render("admin/adminLogin", { adminmessage: "Email or password is incorrect" }); 
      }
    }

  } catch (error) {
    console.log(error.message);
  }
};

const AdminHome = async function (req, res) {
  try {
    let user = req.session.admin
    let bannerImage = await Banner.findOne({isActive:1});
    let bannerData = bannerImage.image;
    res.render("admin/adminHome",{admin:true,user,bannerData});
  } catch (error) {
    console.log(error.message);
  }
};

const addProducts = async function (req, res) {
  try {
    let user = req.session.admin
    await Category.find({}).lean().exec(
      function(err,categoryData){
        console.log(categoryData);
        if(categoryData){
          res.render("admin/addproduct",{category:categoryData,admin:true,user});
        }
      })

    // user = req.session.user
    // res.render("admin/addproduct");
  } catch (error) {
    console.log(error.message);
  }
};

const productToDatabase = async function (req, res) {
  try {
    let user = req.session.admin
    const product = new Product({
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      quantity: req.body.quantity,
      description: req.body.description,
      image: req.file.filename,
    });

    const productData = await product.save();
    
    if (productData) {
      const categoryData = await Category.find({}).lean()
      res.render("admin/addproduct", {
        admin: true,
        successmessage: "Product has been added successfully!",
        user,
        categoryData
      });
    } else {
      res.render("admin/addproduct", {
        admin: true,
        successmessage: "Product hasn't been added",
        user
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadProducts = async function (req, res, next) {
  try {
    let user = req.session.admin
    const productfind = await Product.find({isDeleted:0})
      .lean()
      .exec((err, productData) => {
        if (productData) {
          console.log(productData);
          res.render("admin/products", { products: productData, admin: true,user });
        }
      });
  } catch (error) {
    console.log(error.message);
  }
};

const usersList = async function (req, res) {
  try {
    let user = req.session.admin
    const userFind = await Users.find({})
      .lean()
      .exec(function (err, userData) {
        if (userData) {
          console.log(userData);
          res.render("admin/usersList", { users: userData, admin: true,user });
        }
      });
  } catch (error) {
    console.log(error.message);
  }
};

const productDelete = async function (req, res) {
  try {
    function remove(data) {
      return new Promise(function (resolve, reject) {
        Product.findOneAndUpdate({ _id: objectId(proId) },{$set:{
          isDeleted:1
        }}).then(function (response) {
          resolve(response);
        });
      });
    }

    let proId = req.params.id;
    console.log(proId);

    remove(proId).then(function (response) {
      res.redirect("/admin/products");
    });
  } catch (error) {
    console.log(error.message);
  }
};


const productEdit = async function (req, res) {
  try {
    let user = req.session.admin
    function getProductDetails(data) {
      return new Promise(function (resolve, reject) {
        Product.findOne({ _id: objectId(data) })
          .lean()
          .then(function (products) {
            resolve(products);
          });
      });
    }

    let editProductData = await getProductDetails(req.params.id);
    res.render("admin/editProduct", { editProductData, admin: true,user });
    console.log(editProductData);
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async function (req, res) {
  try {
    function updateProductData(proId, proDetails) {
      return new Promise(function (resolve, reject) {
        Product.updateOne(
          { _id: objectId(proId) },
          {
            $set: {
              name: proDetails.name,
              category: proDetails.category,
              price: proDetails.price,
              quantity: proDetails.quantity,
              description: proDetails.description,
              image: proDetails.image,
            },
          }
        ).then(function (response) {
          resolve();
        });
      });
    }

    updateProductData(req.params.id, req.body).then(function () {
      res.redirect("/admin/products");
    });
  } catch (error) {
    console.log(error.message);
  }
};

const userEdit = async function (req, res) {
  try {
    let user = req.session.admin
    res.render("admin/editUser",{admin:true,user});
  } catch (error) {
    console.log(error.message);
  }
};

const getCategory = async function (req, res) {
  try {
    let user = req.session.admin
    await Category.find({}).lean().exec(
      function(err,categoryData){
        if(categoryData){
          res.render("admin/categories",{category:categoryData,admin:true,user});
        }
      })
  
  } catch (error) {
    console.log(error.message);
  }
};

const CategoryAdd = async function (req, res) {
  try {
    let user = req.session.admin
    res.render("admin/addCategory",{admin:true,user});
  } catch (error) {
    console.log(error.message);
  }
};

const CategoryUpdate = async function(req,res){
  try {
    let user = req.session.admin
    const categoryCheck = req.body.name;
    console.log(categoryCheck)
    const categoryName = await Category.findOne({name:categoryCheck});
    if(categoryName){
      res.render("admin/addCategory",{
        admin:true,
        categoryMessage:"Category already exists",
        user
      })
    }
    else{
      const category = new Category({
        name:req.body.name,
      })
  
      const categoryData = await category.save();
  
      if(categoryData){
        res.render("admin/addCategory",{
          admin:true,
          categoryMessage:"Category has been added",
          user
        })
      }
      else{
        res.render("admin/addCategory",{
          admin:true,
          categoryMessage:"Unable to add category",
          user
        })
      }
    }

  } catch (error) {
    console.log(error.message)
  }
}

const CategoryDelete = function(req,res){
  try {
    function remove(data) {
      return new Promise(function (resolve, reject) {
        Category.deleteOne({ _id: objectId(catId) }).then(function (response) {
          resolve(response);
        });
      });
    }

    let catId = req.params.id;
  
    remove(catId).then(function (response) {
      res.redirect("/admin/categories");
    });
  } catch (error) {
    console.log(error.message)
  }
}

const BlockUser = async function(req,res){
  try {
    let user = req.params.id;
    let userData = await Users.findById({_id:objectId(user)});
    console.log(userData);
      if(userData.isBlocked){
        userData.isBlocked = 0;
        let updatedUser = await userData.save();
        if(updatedUser){
          res.redirect("/admin/usersList")
        }
      }
      else{
        userData.isBlocked = 1;
        let newUser = await userData.save();
        if(newUser){
          res.redirect("/admin/usersList");
        }
      }
   
    
  } catch (error) {
    console.log(error.message)
  }
}

const getCoupons= async function(req,res){
  try {
    let user = req.session.admin
    await Coupons.find({}).lean().exec(function(err,couponData){
      if(couponData){
        res.render("admin/discountCoupons",{couponData,admin:true,user});
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}

const couponUpdate = async function(req,res){
  try {
    let user = req.session.admin
    res.render("admin/addCoupon",{admin:true,user});
  } catch (error) {
    console.log(error.message);
  }
}

const newCoupons = async function(req,res){
  try {
    let user = req.session.admin
    const couponCheck = req.body.name;
    console.log(couponCheck);
    const couponName = await Coupons.findOne({name:couponCheck});
    console.log(couponName)
    if(couponName){
      res.render("admin/addCoupon",{
        admin:true,
        couponMessage: "Coupon already exists",
        user
      })
    }
    else{
      const coupon = new Coupons({
        name: req.body.name,
        type: req.body.type,
        discount: req.body.discount
      })
      const couponData = await coupon.save();
      console.log(couponData);
      if(couponData){
        res.render("admin/addCoupon",{
          admin:true,
          couponMessage:"Coupon has been added",
          user
        })
      }
      else{
        res.render("admin/addCoupon",{
          admin:true,
          couponMessage:"Unable to add new coupon",
          user
        })
      }

    }
  } catch (error) {
    console.log(error.message)
  }
}


const couponBlock = async function(req,res){
  try {
    let couponId = req.params.id;
    let couponData = await Coupons.findOne({_id:objectId(couponId)});
    console.log(couponData)
    if(couponData.isBlocked){
      couponData.isBlocked = 0;
      let Unblockcoupon = await couponData.save();
      if(Unblockcoupon){
        res.redirect("/admin/coupons")
      }
    }
    else{
      couponData.isBlocked = 1;
      let Blockcoupon = await couponData.save();
      if(Blockcoupon){
        res.redirect("/admin/coupons")
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}

const allOrders = async function(req,res){
  try {
    let user = req.session.admin
     await Order.find({}).lean().exec(async function(err,orderData){
      console.log(orderData)
      res.render("admin/adminOrder",{orderData,admin:true,user})
     })
  } catch (error) {
    console.log(error.message)
  }
}

const deliverOrder = async function(req,res){
  try {
    let prodId = req.params.id;
    let orderData = await Order.findByIdAndUpdate({_id:objectId(prodId)},{$set:{isAttempted:0,isDelivered:1,status:"Delivered"}});
    if(orderData){
      res.redirect("/admin/orderList");
    }
  } catch (error) {
    console.log(error.message)
  }
}

const cancelOrder = async function(req,res){
  try {
    let prodId = req.params.id;
    let orderData = await Order.findByIdAndUpdate({_id:objectId(prodId)},{$set:{isAttempted:0,isCancelled:0,status:"Cancelled"}});
    if(orderData){
      res.redirect("/admin/orderList");
    }
  } catch (error) {
    console.log(error.message)
  }
}

const bannerImage = async function(req,res){
  try {
    let user = req.session.admin;
    await Banner.find({}).lean().exec(async function(err,bannerData){
    if(bannerData){
      res.render("admin/bannerList",{bannerData,admin:true,user})
    }
   })
  } catch (error) {
    console.log(error.message)
  }
}

const newBanner = async function(req,res){
  try {
    let user = req.session.admin;
    res.render("admin/addBanner",{admin:true,user});
  } catch (error) {
    console.log(error.message)
  }
}

const updateBanner = async function(req,res){
  try {
    let user = req.session.admin;
    let banner = new Banner({
      name:req.body.name,
      image:req.file.filename
    })

    const bannerData = await banner.save();

    if(bannerData){
      res.render("admin/addBanner",{admin:true,user,successMessage:"Banner has been added"});
    }
    else{
      res.render("admin/addBanner",{admin:true,user,successMessage:"Banner hasn't been added"})
    }
  } catch (error) {
    console.log(error.message)
  }
}

const activeBanner = async function(req,res){
  try {
    let banner = req.params.id;
    let currentBanner = await Banner.findOneAndUpdate({isActive:1},{$set:{isActive:0}})
    if(currentBanner){
      let newBanner = await Banner.findOneAndUpdate({_id:objectId(banner)},{$set:{isActive:1}})
      if(newBanner){
        res.redirect("/admin/bannerList");
      }
    }
  } catch (error) {
    console.log(error.message)
  }
}

const productDownload = async function(req,res){
  try {
    const workBook = new excelJs.Workbook();
    const workSheet = workBook.addWorksheet("My Products");
    workSheet.columns=[
      {header:"S no.",key:"s_no"},
      {header:"Name",key:"name"},
      {header:"Category",key:"category"},
      {header:"Price",key:"price"},
      {header:"Quantity",key:"quantity"},
      {header:"Description",key:"description"},
      {header:"Deleted",key:"isDeleted"}
    ];

    let counter = 1;

    const productData = await Product.find({});

    productData.forEach(function(products){
      products.s_no = counter;
      workSheet.addRow(products);
      counter++;
    })

    workSheet.getRow(1).eachCell(function(cell){
      cell.font = {bold:true};
    })

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
      "Content-Disposition",`attachment; filename=products.xlsx`
    )

    return workBook.xlsx.write(res).then(function(){
      res.status(200);
    })

  } catch (error) {
    console.log(error.message);
  }
} 

const usersDownload = async function(req,res){
  try {
    const workBook = new excelJs.Workbook();
    const workSheet = workBook.addWorksheet("My users");
    workSheet.columns=[
      {header:"S no.",key:"s_no."},
      {header:"Name",key:"name"},
      {header:"Email",key:"email"},
      {header:"Mobile",key:"mobile"},
      {header:"Verified",key:"isVerified"},
      {header:"Blocked",key:"isBlocked"}
    ]

    let counter =1;

    const userData = await Users.find({});

    userData.forEach(function(users){
      users.s_no = counter;
      workSheet.addRow(users);
      counter++;
    })

    workSheet.getRow(1).eachCell(function(cell){
      cell.font = {bold:true};
    })

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
      "Content-Disposition",`attachment;filename=users.xlsx`
    )
    
    return workBook.xlsx.write(res).then(function(){
      res.status(200);
    })
  } catch (error) {
    console.log(error.message)
  }
}

const orderDownload = async function(req,res){
  try {
    const workBook = new excelJs.Workbook();
    const workSheet = workBook.addWorksheet("Orders");
    workSheet.columns = [
      {header:"S no.",key:"s_no"},
      {header:"Name",key:"userName"},
      {header:"Amount",key:"amount"},
      {header:"Payment",key:"payment"},
      {header:"Country",key:"country"},
      {header:"Address",key:"address"},
      {header:"State",key:"state"},
      {header:"City",key:"city"},
      {header:"Zip",key:"zip"},
      {header:"Date",key:"isAttempted"},
      {header:"Status",key:"status"},
      {header:"Offer",key:"offer"}
    ];

    let counter = 1;

    const orderData = await Order.find({});

    orderData.forEach(function(orders){
      orders.s_no = counter;
      workSheet.addRow(orders);
      counter++;
    })

    workSheet.getRow(1).eachCell(function(cell){
      cell.font = {bold:true};
    })

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
      "Content-Disposition",`attachment; filename=orders.xlsx`
    )

    return workBook.xlsx.write(res).then(function(){
      res.status(200);
    })
  } catch (error) {
    console.log(error.message)
  }
}

// const notFound = async function(req,res){
//   res.render("404");
// }

const adminLogout = async function(req,res){
  try {
    req.session.admin = null;
    res.redirect("/admin")
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  loadAdmin,
  loadProducts,
  addProducts,
  productToDatabase,
  usersList,
  productDelete,
  productEdit,
  updateProduct,
  userEdit,
  getCategory,
  CategoryAdd,
  verifyAdmin,
  AdminHome,
  CategoryUpdate,
  CategoryDelete,
  BlockUser,
  getCoupons,
  couponUpdate,
  newCoupons,
  couponBlock,
  allOrders,
  adminLogout,
  deliverOrder,
  cancelOrder,
  bannerImage,
  newBanner,
  updateBanner,
  activeBanner,
  productDownload,
  usersDownload,
  orderDownload,
  // notFound
};
