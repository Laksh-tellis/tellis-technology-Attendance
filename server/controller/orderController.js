const Order = require('../models/Order');
const Product = require('../models/Product');



createOrder = async (req, res) => {
    try {
      const { products, address } = req.body; // products: [{ product, quantity }]
      const userId = req.user.userId; // user from auth middleware
  
      if (!products || products.length === 0) {
        return res.status(400).json({ error: 'Order must include at least one product' });
      }
  
    //   // Calculate total price
    //   let totalPrice = 0;
    //   for (const item of products) {
    //     const product = await Product.findById(item.product);
    //     if (!product) return res.status(404).json({ error: `Product ${item.product} not found` });
    //     totalPrice += product.price * item.quantity;
    //   }
    // const ProductDetails = await Promise.all(
    //     products.map( items => Product.findById(items.product))
    // )
  
      // Create order
      const order = new Order({
        user: userId,
        products,
        totalPrice,
        address,
        status: 'pending'
      });
  
      await order.save();
  
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: 'Server error while creating order' });
    }
  };