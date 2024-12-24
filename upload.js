const multer = require('multer');
const path = require('path');

// تحديد مكان تخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // المجلد الذي سيتم حفظ الملفات فيه
  },
  filename: (req, file, cb) => {
    // تعيين اسم فريد للملف باستخدام الطابع الزمني والامتداد الأصلي
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

// إعداد multer للتحميل
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // الحد الأقصى لحجم الملف (10 ميجابايت)
  fileFilter: (req, file, cb) => {
    // قبول جميع أنواع الملفات دون التحقق من النوع أو الامتداد
    cb(null, true); // قبول جميع الملفات
  },
});

module.exports = upload;

