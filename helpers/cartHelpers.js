const db = require("../model/connection");
const cartSchema = require("../model/cart");

const objectId = require("mongodb").ObjectId;

module.exports = {
  addToCart_post: (proId, uId, qty, subTotal) => {
    let productObj = {
      _id: objectId(proId),
      quantity: qty,
      subtotal: subTotal,
    };
    console.log("productObj :", productObj);
    return new Promise(async (resolve, reject) => {
      let userCartDetails = await cartSchema.cart.findOne({ userId: uId });

      if (userCartDetails == null) {
        const cartItem = new cartSchema.cart({
          userId: objectId(uId),
          product: productObj,
        });
        await cartItem.save().then(() => {
          resolve();
        });
      } else {
        console.log("test");

        let userCart = await cartSchema.cart.findOne({
          userId: objectId(uId),
          "product._id": productObj._id,
        });

        if (userCart) {
          await cartSchema.cart.updateOne(
            { userId: objectId(uId), "product._id": productObj._id },
            {
              $set: {
                "product.$.quantity": qty,
                "product.$.subtotal": subTotal,
              },
            }
          );
          resolve();
        } else {
          await cartSchema.cart.updateOne(
            { userId: objectId(uId) },
            { $push: { product: productObj } }
          );
          resolve();
        }
      }
    });
  },

  viewUser_cart: (uId) => {
    let response = {};

    return new Promise(async (resolve, reject) => {
      [productCart] = await cartSchema.cart
        .find({ userId: objectId(uId) })
        .populate("product._id");

      (response.cart = productCart),
        (response.count = productCart?.product.length);

      console.log("response of populate", response);

      resolve(response);
    });
  },
  viewCart_aggregate: async (uId) => {
    console.log("userid", uId);
    try {
      const result = await cartSchema.cart.aggregate([
        {
          $match: {
            userId: objectId(uId),
          },
        },
        {
          $unwind: {
            path: "$product",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product._id",
            foreignField: "_id",
            as: "details",
          },
        },
        {
          $unwind: {
            path: "$details",
            includeArrayIndex: "string",
          },
        },
        {
          $project: {
            _id: 0,
            ProId: "$product._id",
            Productname: "$details.Productname",
            quantity: "$product.quantity",
            Image: "$details.Image",
            Price: "$details.Price",
            category: "$details.category",
            subtotal: "$product.subtotal",
          },
        },
      ]);
      console.log("aggregated", result);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateCart: (proId, uId, qty, subTotal) => {
    console.log("inside-helper", proId);
    return new Promise(async (resolve, reject) => {
      await cartSchema.cart
        .updateOne(
          { userId: objectId(uId), "product._id": objectId(proId) },
          {
            $set: { "product.$.quantity": qty, "product.$.subtotal": subTotal },
          }
        )
        .then((data) => {
          resolve();
        });
    });
  },
  cartTotal: (uId) => {
    try {
      return new Promise(async (resolve, reject) => {
        // console.log(uId)
        await cartSchema.cart
          .aggregate([
            {
              $match: {
                userId: objectId(uId),
              },
            },
            {
              $unwind: "$product",
            },
            {
              $project: {
                subtotal: "$product.subtotal",
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$subtotal",
                },
              },
            },
          ])
          .then((response) => {
            // console.log(response);

            resolve(response);
          });
      });
    } catch (error) {}
  },

  deleteProInCart: (proId, uId) => {
    console.log("testinside helperr");
    return new Promise(async (resolve, reject) => {
      await cartSchema.cart
        .updateOne(
          { userId: objectId(uId) },
          { $pull: { product: { _id: objectId(proId) } } }
        )
        .then((result) => {
          resolve(result);
        });
    });
  },
  addAdress: (uId, data) => {
    let addressobj = {
      firstName: data.fname,
      lastName: data.lname,
      street: data.street,
      building: data.building,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      mobile: data.mobile,
      email: data.email,
    };

    console.log(addressobj, "addressobj");
    return new Promise(async (resolve, reject) => {
      let addressDetails = await db.address.findOne({ userid: uId });

      if (addressDetails == null) {
        const addressItem = new db.address({
          userid: objectId(uId),
          Address: addressobj,
        });

        await addressItem.save().then(() => {
          let message = "address added";
          resolve(message);
        });
      } else {
        await db.address.updateOne(
          { userId: objectId(uId) },
          { $push: { Address: addressobj } }
        );
        resolve();
      }
    });
  },
  emptyCart: async (uId) => {
    try {
      await cartSchema.cart.updateOne(
        { userId: objectId(uId) },
        { $set: { product: [] } }
      );
    } catch (error) {
      console.log("action not complete cart is not empty");
    }
  },
};
