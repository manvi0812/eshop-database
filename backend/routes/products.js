const { Product } = require("../Models/Product");
const express = require("express");
const { Category } = require("../Models/category");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  //localhost:3000/api/v1/products?categories=catId1,catId2
  //?categories=catId1,catId2 -> query
  let filter = {};
  if (req.query.categories) {
    //req.query.categories= catId1,catId2(passed in url), req.query= {categories: 'catId1,catId2'}
    filter = { category: req.query.categories.split(",") }; //{category(field_name): ...}
  }
  const productList = await Product.find(filter).populate("category"); // find() returns a promise

  if (!productList) {
    res.send(500).json({ success: false });
  }
  res.send(productList);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.send(500).json({ success: false });
  }
  res.send(product);
});

router.post("/", async (req, res) => {
  const category = await Category.findById(req.body.category); // as category field is required, category id must be passed.
  if (!category) return res.status(400).send("Invalid category");

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    // dateCreated: req.body.dateCreated,
  });
  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created.");

  res.send(product);
});

router.put("/:id", async (req, res) => {
  // put(): to update the fields.
  if (!mongoose.isValidObjectId(req.params.id)) {
    // this is used in case if we send some invalid product id, to catch that error.
    res.status(400).send("Invalid product Id.");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category");

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(404).send("The product cannot be updated.");
  }
  res.send(updatedProduct);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id) //findByIdAndRemove(req.params.id): takes the id via params and remove that object if present.
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted." });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "The product is not found." });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);
  //countDocuments() : counts all the items present in the model object.
  if (!productCount) {
    return res.send(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featuredProducts = await Product.find({
    // find({isFeatured: true}): returns the objects with field "isFeatured:true".
    isFeatured: true,
  }).limit(+count);
  // limit(): limits the no of featured products to be displayed.
  if (!featuredProducts) {
    return res.send(500).json({ success: false });
  }
  res.send(featuredProducts);
});

module.exports = router;
