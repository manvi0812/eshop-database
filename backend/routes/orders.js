const { Order } = require("../Models/order");
const OrderItem = require("../Models/order-item");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const ordersList = await Order.find();
  if (!ordersList) {
    res.send(500, { success: false });
  }
  res.send(ordersList);
});

router.post("/", async (req, res) => {
  // when the post req is sent/created, we have to create the order items first in the db & then attach/relate them to the order req below.
  // we won't get directly the orderItems from req.body. we need only array of ids

  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();
      console.log(newOrderItem);
      return newOrderItem._id;
    })
  );
  // console.log(orderItemsIds);
  const orderItemsIdsResolved = await orderItemsIds;

  // const totalPrices = await Promise.all(
  //   orderItemsIdsResolved.map(async (orderItemId) => {
  //     const orderItem = await OrderItem.findById(orderItemId).populate(
  //       "product",
  //       "price"
  //     );
  //     const totalPrice = orderItem.product.price * orderItem.quantity;
  //     return totalPrice;
  //   })
  // );

  // const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: req.body.totalPrice,
    user: req.body.user,
  });
  // order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.send(order);
});

module.exports = router;
