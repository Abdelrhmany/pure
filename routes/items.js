const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Item = require('../models/item');
const upload = require('../upload');

// POST: Add a new item
router.post('/', upload.array('images', 5), async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(401).json({ message: 'User is not authenticated' }); // التحقق من تسجيل الدخول
  }

  try {
    const { title, description, price, location, category, condition, subcategory } = req.body;
    const imagePaths = req.files.map(file => file.path);
    
    // استخدام معلومات المستخدم (id و displayName)
    const newItem = new Item({
      title,
      description,
      price,
      location,
      category,
      condition,
      subcategory,
      sellerid: 'req.user.id', // إضافة user id
      sellername: 'req.user.displayName', // إضافة user displayName
      images: imagePaths, // حفظ مسارات الصور فقط
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem); // إعادة العنصر المحفوظ كاستجابة
  } catch (error) {
    next(error);
  }
});

// GET: Get all items with images as Base64
router.get('/', async (req, res, next) => {
  try {
    const items = await Item.find();

    // تحويل الصور إلى Base64 لكل العناصر
    const itemsWithImages = await Promise.all(
      items.map(async item => {
        const images = await Promise.all(
          item.images.map(imagePath => {
            const filePath = imagePath;
            if (fs.existsSync(filePath)) {
              const fileBuffer = fs.readFileSync(filePath);
              const base64Image = `data:image/${path.extname(filePath).substring(1)};base64,${fileBuffer.toString('base64')}`;
              return base64Image;
            }
            return null; // إذا كانت الصورة غير موجودة
          })
        );

        return {
          ...item.toObject(),
          images: images.filter(img => img !== null), // تجاهل الصور غير الموجودة
        };
      })
    );

    res.status(200).json(itemsWithImages);
  } catch (error) {
    next(error);
  }
});

// GET: Get a single item by ID with images as Base64
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // تحويل الصور إلى Base64
    const images = await Promise.all(
      item.images.map(imagePath => {
        const filePath = imagePath;
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const base64Image = `data:image/${path.extname(filePath).substring(1)};base64,${fileBuffer.toString('base64')}`;
          return base64Image;
        }
        return null; // إذا كانت الصورة غير موجودة
      })
    );

    // تضمين الصور المحولة في الاستجابة
    res.status(200).json({
      ...item.toObject(),
      images: images.filter(img => img !== null), // تجاهل الصور غير الموجودة
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete an item by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully', item });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const router = express.Router();
// const Item = require('../models/item');
// const upload = require('../upload');
// const napp = require('../app');

// // POST: Add a new item
// router.post('/', upload.array('images', 5), async (req, res, next) => {
//   try {
//     const { title, description, price, location, category, condition, subcategory } = req.body;
//     const imagePaths = req.files.map(file => file.path);
//     const newItem = new Item({
//       title,
//       description,
//       price,
//       location,
//       category,
//       condition,
//       subcategory,
//       sellerid: req.user.id,
//       sellername: req.user.displayName,
//       images: imagePaths, // حفظ المسارات فقط
//     });
//     const savedItem = await newItem.save();
//     res.status(201).json(savedItem);
//   } catch (error) {
//     next(error);
//   }
// });

// // GET: Get all items with images as Base64
// router.get('/', async (req, res, next) => {
//   try {
//     const items = await Item.find();

//     // تحويل الصور إلى Base64 لكل العناصر
//     const itemsWithImages = await Promise.all(
//       items.map(async item => {
//         const images = await Promise.all(
//           item.images.map(imagePath => {
//             const filePath = imagePath; // لا حاجة لتغيير المسار هنا
//             if (fs.existsSync(filePath)) {
//               const fileBuffer = fs.readFileSync(filePath);
//               const base64Image = `data:image/${path.extname(filePath).substring(1)};base64,${fileBuffer.toString('base64')}`;
//               return base64Image;
//             }
//             return null; // إذا كانت الصورة غير موجودة
//           })
//         );

//         return {
//           ...item.toObject(),
//           images: images.filter(img => img !== null), // تجاهل الصور غير الموجودة
//         };
//       })
//     );

//     res.status(200).json(itemsWithImages);
//   } catch (error) {
//     next(error);
//   }
// });

// // GET: Get a single item by ID with images as Base64
// router.get('/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const item = await Item.findById(id);
//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     // تحويل الصور إلى Base64
//     const images = await Promise.all(
//       item.images.map(imagePath => {
//         const filePath = imagePath; // لا حاجة لتغيير المسار هنا
//         if (fs.existsSync(filePath)) {
//           const fileBuffer = fs.readFileSync(filePath);
//           const base64Image = `data:image/${path.extname(filePath).substring(1)};base64,${fileBuffer.toString('base64')}`;
//           return base64Image;
//         }
//         return null; // إذا كانت الصورة غير موجودة
//       })
//     );

//     // تضمين الصور المحولة في الاستجابة
//     res.status(200).json({
//       ...item.toObject(),
//       images: images.filter(img => img !== null), // تجاهل الصور غير الموجودة
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// // DELETE: Delete an item by ID
// router.delete('/:id', async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const item = await Item.findByIdAndDelete(id);
//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }
//     res.status(200).json({ message: 'Item deleted successfully', item });
//   } catch (error) {
//     next(error);
//   }
// });

// module.exports = router;

















// const express = require('express');
// const router = express.Router();
// const Item = require('../models/item'); // استيراد الموديل الخاص بالإعلانات
// const rotapp = require('../app'); // استيراد الموديل الخاص بالإعلانات
// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next(); // استمر في تنفيذ الكود التالي إذا كان المستخدم مسجل الدخول
//   }
//   res.redirect("/"); // أعد التوجيه إلى الصفحة الرئيسية إذا لم يكن المستخدم مسجل الدخول
// }

// // جلب جميع الإعلانات أو تصفية حسب الفئة
// router.get('/',async (req, res, next) => {
//   if(true){
//     try {
//       const { category, status, location } = req.query; // يمكنك تصفية الإعلانات حسب الفئة أو الموقع أو الحالة
//       let query = {};
  
//       if (category) {
//         query.category = category;
//       }
//       if (status) {
//         query.status = status;
//       }
//       if (location) {
//         query.location = location;
//       }
  
//       const items = await Item.find(query);
//       res.json(items);
//     } catch (error) {
//       next(error);
//     }
//    }else{ 
//   res.redirect("/");}
// });


// // POST request لإنشاء عنصر جديد




// router.post('/', async (req, res, next) => {
// if(req.isAuthenticated){

//   try {
//     const { title, description, price, location, category, condition, postedBy, images, additionalDetails } = req.body;

//     const newItem = new Item({
//       title,
//       description,
//       price,
//       location,
//       category,
//       condition,
//       postedBy,
//       images,
//       additionalDetails
//     });

//     const savedItem = await newItem.save();
//     res.status(201).json(savedItem);
//   } catch (error) {
//     next(error);
//   }
// }else{res.redirect('/')}
// });

// // تحديث إعلان باستخدام ID (PUT)
// router.put('/:id', async (req, res, next) => {
// if(req.isAuthenticated){
//   try {
//     const { title, description, price, location, category, condition, status, additionalDetails } = req.body;

//     const updatedItem = await Item.findByIdAndUpdate(
//       req.params.id,
//       {
//         title,
//         description,
//         price,
//         location,
//         category,
//         condition,
//         status,
//         additionalDetails
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedItem) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     res.json(updatedItem);
//   } catch (error) {
//     next(error);
//   }

// }else(res.redirect('/'))
// });

// // حذف إعلان باستخدام ID (DELETE)
// router.delete('/:id', async (req, res, next) => {
//  if(req.isAuthenticated){
//   try {
//     const deletedItem = await Item.findByIdAndDelete(req.params.id);

//     if (!deletedItem) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     res.json({ message: 'Item deleted successfully', deletedItem });
//   } catch (error) {
//     next(error);
//   } 
// }else{
//   res.redirect('/')
//  }

// });

// // جلب إعلان باستخدام ID (GET)
// router.get('/:id', async (req, res, next) => {
//   try {
//     const item = await Item.findById(req.params.id);

//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }

//     // تحديث عدد المشاهدات
//     item.views += 1;
//     await item.save();

//     res.json(item);
//   } catch (error) {
//     next(error);
//   }
// });
// module.exports = router;
