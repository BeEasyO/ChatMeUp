const request = require("request");
const GetRandomTumblrImage = async () =>
  new Promise((resolve, reject) =>
    request({
      url: `https://api.tumblr.com/v2/blog/mydistinguishedbouquetpeanut/posts?api_key=${process.env.TUMBLR_KEY}&type=photo`,
      json: true,
    },
    (error, response, body) => {
      if (error) {
        reject('Unable to connect');
      } else if (body.meta.status === 200) {
      	var images_array = [];
        body.response.posts.forEach(function(obj) {
				obj.photos.forEach(function(photo) {
					if(photo.original_size.width>photo.original_size.height){
						images_array.push(photo.original_size.url);
					} 
				});
			});
        var random = Math.floor(Math.random() * images_array.length);
        resolve(images_array[random]);
      }
    }),
  );
module.exports.GetRandomTumblrImage = GetRandomTumblrImage;