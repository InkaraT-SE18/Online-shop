const express = require('express');
const { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const Order = require("../models/orders");
const Product = require("../models/Product");
const router = express.Router();
router.get('/', getProducts);           
router.post('/', createProduct);        
router.put('/:id', updateProduct);  
router.delete('/:id', deleteProduct);   

router.get("/popular", async (req, res) => {
  try {
    const popularProducts = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { _id: "$products.product", count: { $sum: "$products.quantity" } } }, 
      { $sort: { count: -1 } }, 
      { $limit: 5 },
      { 
        $lookup: { 
          from: "products", 
          localField: "_id", 
          foreignField: "_id", 
          as: "product" 
        } 
      },
      { $unwind: "$product" }, 
      { 
        $project: { 
          _id: "$product._id",
          name: "$product.name",
          image_url: "$product.image_url",
          price: "$product.price",
          count: 1
        } 
      }
    ]);

    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
