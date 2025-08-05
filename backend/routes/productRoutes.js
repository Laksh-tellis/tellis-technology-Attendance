const express = require('express');
const router = express.Router();
const {getAllProducts,getProductById, createProduct, updateProduct, deleteProduct} = require("../controller/productController");
const {autorizedRoles} = require("../middleware/roleMiddleware");   
const {verifyToken} =  require("../middleware/authMiddlewware");
 

router.get("/",verifyToken,getAllProducts);
router.get("/:id",verifyToken,getProductById);
router.post("/",verifyToken,autorizedRoles("admin","manager"),createProduct);
router.put("/:id",verifyToken,autorizedRoles("admin","manager"),updateProduct);
router.delete("/:id", verifyToken, autorizedRoles("admin"), deleteProduct);    

module.exports = router;