const db = require("../model/connection");

const objectId = require("mongodb").ObjectId;




module.exports={


    findAllcategories: () => {
        return new Promise(async (resolve, reject) => {
          await db.category
            .find()
            .exec()
            .then((response) => {
              resolve(response);
            });
        });
      },
    
      postAddProduct: (userData, filename) => {
        return new Promise((resolve, reject) => {
          uploadedImage = new db.products({
            Productname: userData.name,
            ProductDescription: userData.description,
            Quantity: userData.quantity,
            Image: filename,
            category: userData.category,
            Price: userData.Price,
            OfferPrice: userData.OfferPrice,
          });
          uploadedImage.save().then((data) => {
            resolve(data);
          });
        });
      },
    
      getViewProducts: (page, perPage) => {
        return new Promise(async (resolve, reject) => {
          await db.products
            .find()
            .skip((page - 1) * perPage)
            .limit(perPage)
            .then((response) => {
              resolve(response);
            });
        });
      },
    
      get_ViewProductDetails: (id) => {
        return new Promise(async (resolve, reject) => {
          await db.products
            .find({ _id: id })
            .exec()
            .then((response) => {
              console.log(response);
              console.log(response[0]);
              resolve(response[0]);
            });
        });
      },
    
      addCategory: (data) => {
        console.log(data);
        return new Promise(async (resolve, reject) => {
          const catData = new db.category({ CategoryName: data.category });
          console.log(catData);
          await catData.save().then((data) => {
            // console.log(data)
            resolve(data);
          });
        });
      },
      categoryCheck: async (data) => {
        let check = await db.category.findOne({ CategoryName: data });
        if (check) {
          return true;
        } else {
          return false;
        }
      },
    
      editcategory: (productId) => {
        return new Promise(async (resolve, reject) => {
          await db.category
            .findOne({ _id: productId })
            .exec()
            .then((response) => {
              resolve(response);
            });
        });
      },
      postEditCategory: (productId, editedcat) => {
        return new Promise(async (resolve, reject) => {
          await db.category
            .updateOne(
              { _id: productId },
              {
                $set: {
                  CategoryName: editedcat,
                },
              }
            )
            .then((response) => {
              resolve(response);
            });
        });
      },
    
      viewAddCategory: () => {
        return new Promise(async (resolve, reject) => {
          await db.category
            .find()
            .exec()
            .then((response) => {
              resolve(response);
            });
        });
      },
    
      catNames: async (id) => {
        let catname = await db.category.findOne({ _id: id });
        return catname.CategoryName;
      },
      findProductsWithCategory: async (catname) => {
        let products = await db.products.find({ category: catname });
        return products.length;
      },
    
      delCategory: (delete_id) => {
        console.log(delete_id);
        return new Promise(async (resolve, reject) => {
          await db.category.deleteOne({ _id: delete_id }).then((response) => {
            resolve(response);
          });
        });
      },
    
      editProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
          await db.products
            .findOne({ _id: productId })
            .exec()
            .then((response) => {
              resolve(response);
            });
        });
      },
    
      postEditProduct: (productId, editedData, imageArray) => {
        console.log();
        return new Promise(async (resolve, reject) => {
          await db.products
            .updateOne(
              { _id: productId },
              {
                $set: {
                  Productname: editedData.name,
                  ProductDescription: editedData.description,
                  Quantity: editedData.quantity,
                  Price: editedData.price,
                  OfferPrice: editedData.OfferPrice,
                  category: editedData.category,
                  Image: imageArray,
                },
              }
            )
            .then((response) => {
              console.log(response);
    
              resolve(response);
            });
        });
      },
      deleteProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
          await db.products.deleteOne({ _id: productId }).then((response) => {
            resolve(response);
          });
        });
      }
    
     


}