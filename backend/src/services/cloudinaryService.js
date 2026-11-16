const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");

const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from([fileBuffer]).pipe(uploadStream);
  });
};

const uploadMultipleImages = async (files) => {
  const uploadResults = await Promise.allSettled(
    files.map((file) => uploadImage(file.buffer))
  );

  const uploadedImages = uploadResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const failedUpload = uploadResults.find(
    (result) => result.status === "rejected"
  );

  if (failedUpload) {
    await Promise.allSettled(
      uploadedImages.map((image) => deleteImage(image.publicId))
    );

    throw failedUpload.reason;
  }

  return uploadedImages;
};

const deleteImage = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  return result;
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
};