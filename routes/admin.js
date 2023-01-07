var express = require("express");
var router = express.Router({mergeParams:true});
var adminController = require('../controllers/admin-controller');
const auth = require("../middleware/adminAuth");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/product-image'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({storage:storage});


router.get("/",auth.isLogout,adminController.loadAdmin);

router.post("/",adminController.verifyAdmin);

router.get("/adminHome",auth.isLogin,adminController.AdminHome);

router.get("/products",auth.isLogin,adminController.loadProducts);

router.get('/addproduct',auth.isLogin,adminController.addProducts);

router.post('/addproduct',upload.single('image'), adminController.productToDatabase);

router.get("/usersList",auth.isLogin,adminController.usersList);

router.get("/deleteProduct/:id",adminController.productDelete);

router.get("/editProduct/:id",adminController.productEdit);

router.post("/editProduct/:id",upload.single('image'),adminController.updateProduct);

router.get("/editUser/:id",adminController.userEdit);

router.get("/categories",auth.isLogin,adminController.getCategory);

router.get("/addCategory",auth.isLogin,adminController.CategoryAdd);

router.post("/addCategory",adminController.CategoryUpdate);

router.get("/deleteCategory/:id",adminController.CategoryDelete);

router.get("/userBlock/:id",adminController.BlockUser);

router.get("/coupons",auth.isLogin,adminController.getCoupons);

router.get("/addCoupons",auth.isLogin,adminController.couponUpdate);

router.post("/addCoupons",adminController.newCoupons);

router.get("/blockCoupon/:id",adminController.couponBlock);

router.get("/orderList",auth.isLogin,adminController.allOrders);

router.get("/orderDeliver/:id",adminController.deliverOrder);

router.get("/orderCancel/:id",adminController.cancelOrder);

router.get("/bannerList",adminController.bannerImage);

router.get("/addBanner",adminController.newBanner);

router.post("/addBanner",upload.single('image'),adminController.updateBanner);

router.get("/logout",auth.isLogin,adminController.adminLogout);

router.get("/selectBanner/:id",adminController.activeBanner);

router.get("/exportProducts",adminController.productDownload);

router.get("/exportUsers",adminController.usersDownload);

router.get("/exportOrders",adminController.orderDownload);

// router.get("*",adminController.notFound);


module.exports = router;
