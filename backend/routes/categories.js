const { Category } = require("../Models/category");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.send(500).json({ success: false });
  }
  res.send(categoryList);
});

router.get("/:id", async (req, res) => {
  const categoryById = await Category.findById(req.params.id);
  if (!categoryById) {
    res.send(500).json({ message: "The category with this ID is not found." });
  }
  res.send(categoryById);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) {
    return res.status(404).send("The category cannot be created");
  }
  res.send(category);
});

router.put("/:id", async (req, res) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      color: req.body.color,
      icon: req.body.icon,
    },
    { new: true }
  );
  if (!updatedCategory) {
    return res.status(404).send("The category cannot be created");
  }
  res.send(updatedCategory);
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "The category is deleted." });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "The category is not found." });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
