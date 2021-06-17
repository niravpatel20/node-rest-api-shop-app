const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {

    Order.find().select('productId quantity').populate('productId', 'name').exec().then((orders) => {
        const response = {
            count: orders.length,
            orders: orders.map((order) => {
            return {
                productId: order.productId,
                quantity: order.quantity,
                url: `localhost:8000/orders/${order._id}`
            }
        })
    }
        res.status(200).json(response);
    }).catch((err) => {
        res.status(500).json({
            error: err
        })
    })
    
})

router.post('/', (req, res, next) => {

    Product.findById(req.body.productId).exec().then((product) => {
        if(!product){
            res.status(404).json({
                error: 'Product Not Found!'
            })
            return;
        }

        const order = new Order({ 
            _id: new mongoose.Types.ObjectId(),
            productId: req.body.productId,
            quantity: req.body.quantity
        });

        order.save().then((order) => {
            res.status(201).json(order);
        })  

    }).catch((err) => {
       res.status(500).json({
           error: err
       })
    })

})

router.get('/:orderId', (req, res, next) => {

    const orderId = req.params.orderId;
    
    Order.findById(orderId).populate('productId').exec().then((order) => {

        if(order){
            const response = {
                order: {
                    product: order.productId,
                    quantity: order.quantity
                },
                suggest: {
                    message: 'To get all orders',
                    type: 'GET',
                    url: `localhost:8000/orders`
                }
            }
    
            res.status(200).json(response);
            return;
        }

        res.status(404).json({
            error: {
                message: "Order not found!"
            }
        })
        
    }).catch((err) => {
        res.status(500).json({
            error: err
        })
    });

})

router.delete('/:orderId', (req, res, next) => {

    const orderId = req.params.orderId;
    
    Order.findByIdAndDelete(orderId).exec().then((order) => {

        if(order){
            const response = {
                message: "Order deleted successfully!",
                request: {
                    message: 'To see all orders',
                    type: 'GET',
                    url: `localhost:8000/orders`
                }
            }
    
            res.status(200).json(response);
            return;
        }

        res.status(404).json({
            error: {
                message: "Order not found!"
            }
        })
        
    }).catch((err) => {
        res.status(500).json({
            error: err
        })
    });



})


module.exports = router;