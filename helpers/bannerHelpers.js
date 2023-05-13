
const bannerSchema = require("../model/banner");
const objectId = require("mongodb").ObjectId;




module.exports={

    get_Allbanners: async (page,perPage) => {
        let bannersFound = await bannerSchema.banner.find().skip((page - 1) * perPage)
        .limit(perPage);
        return bannersFound;
      },
    
      postAddBanner: (texts, Image) => {
        return new Promise(async (resolve, reject) => {
          console.log("inside promise");
          console.log("imagename", Image);
          uploadedBanner = new bannerSchema.banner({
            title: texts.title,
            description: texts.description,
            link: texts.link,
            image: Image,
            state: "Inactive",
          });
          await uploadedBanner.save().then((response) => {
            resolve(response);
          });
        });
      },
      postEditBanner: (bannerId, editedData, imageArray) => {
        return new Promise(async (resolve, reject) => {
          await bannerSchema.banner
            .updateOne(
              { _id: bannerId },
              {
                $set: {
                  title: editedData.title,
                  image: imageArray,
                  description: editedData.description,
                  link: editedData.link,
                },
              }
            )
            .then((response) => {
              resolve(response);
            });
        });
      },
    
      bannerPush: async () => {
        try {
          let banners = await bannerSchema.banner.find();
          return banners;
        } catch (error) {
          console.log("didnt get the banners");
        }
      },
    
      delete_banner: async (bannerId) => {
        let deleted = await bannerSchema.banner.deleteOne({
          _id: objectId(bannerId),
        });
        return deleted;
      }




}