const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});

// const multer = require("multer");
// const path = require("path");

// // Define storage and file filter
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Specify the destination directory where uploaded files will be stored
//     cb(null, path.join(__dirname, "uploads"));
//   },
//   filename: (req, file, cb) => {
//     console.log("hello file",file)
//     // Customize the filename as needed (e.g., add a timestamp)
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   console.log("hello file",file)
//   const ext = path.extname(file.originalname).toLowerCase();
//   if ([".jpg", ".jpeg", ".png"].includes(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error("File type is not supported"), false);
//   }
// };

// // Create the Multer instance with the defined storage and file filter
// const upload = multer({ storage, fileFilter });

// module.exports = upload;
