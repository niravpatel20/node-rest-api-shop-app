const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    } 
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({storage, 
    limits: { fileSize: 1024*1024*5 },
    fileFilter
});

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    
    Product.find().exec().then((products) => {
        
        const response = {
            count: products.length,
            products: products.map((product) => {
                return {
                    name: product.name,
                    price: product.price,
                    url: `localhost:8000/products/${product._id}`,
                    productImage: product.productImage
                }
            })
        }

        res.status(200).json(response);

    }).catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})

router.post('/', upload.single('productImage') ,(req, res, next) => {
    
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: `localhost:8000/uploads/${req.file.filename}`
    })

    product.save().then((product) => {
        
        const response = {
            message: 'New Product has been created!',
            product: {
                name: product.name,
                price: product.price,
                _id: product._id,
                productImage: product.productImage
            }
        }

        res.status(201).json(response);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
})

router.get('/:productId', (req, res, next) => {

    const pId = req.params.productId;
    
    Product.findById(pId).exec().then((product) => {

        if(product){
            const response = {
                product: {
                    name: product.name,
                    price: product.price,
                    _id: product._id,
                    productImage: product.productImage
                },
                request: {
                    message: 'To show all products',
                    url: 'localhost:8000/products'
                }
            }
    
            res.status(201).json(response);

            return;
        }
        
        res.status(404).json({
            message: "No Product found with given ID!"
        })

        
    }).catch((err) => {
        res.status(400).json({
            message: err
        });
    })

})

router.patch('/:productId', (req, res, next) => {

    const pId = req.params.productId;

    const toUpdate = req.body;

    console.log(toUpdate);

    Product.findByIdAndUpdate(pId, toUpdate, {new: true}).then((product) => {
        if(product){
            const response = {
                message: 'Product has been updated!',
                url: `localhost:8000/products/${product._id}`
            }
            res.status(200).json(response);
            return;
        }
        
        res.status(404).json({
            message: "No Product found with given ID!"
        })

    }).catch((err) => {
        res.status(500).json({
            message: err.message
        });
    })
})

router.delete('/:productId', (req, res, next) => {

    const pId = req.params.productId;

    Product.findByIdAndRemove(pId).then((product) => {
        if(product){
            const response = {
                message: 'Product deleted Successfully!',
                request: {
                    type: 'POST',
                    format: { "name": "String", "price": "Number"}
                }
            }   
            res.status(200).json(response);
            return;
        }
        
        res.status(404).json({
            message: "No Product found with given ID!"
        })

    }).catch((err) => {
        res.status(500).json({
            message: err.message
        });
    })

})

module.exports = router;

