const Product = require("../models/product.model");

const getAllProducts = async (req,res) => {
    try{
        const products = await Product.find();
        res.status(200).json(products);
    }
    catch(err){
        res.status(500).json({message:`Error in fetching products ${err.message}`});
        console.log(err);
    }
}

const getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ error: 'Server Error' });
    }
  };

  const createProduct = async (req, res) => {
    try {
        const {name,description,price,category,image,stock} = req.body; 
        //setup image upload
      const newProduct = new Product({name,description,price,category,image,stock});
      await newProduct.save();
      res.status(201).json({message:"Product created successfully",product:newProduct});
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

 const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const {name,description,price,category,image,stock} = req.body;
        
      const updated = await Product.findByIdAndUpdate(id, {name,description,price,category,image,stock}, { new: true });

      if (!updated) return res.status(404).json({ error: 'Product not found' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Server Error' });
    }
  };

module.exports = {getAllProducts,getProductById, createProduct, updateProduct, deleteProduct};