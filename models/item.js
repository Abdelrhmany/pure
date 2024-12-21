

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true,
    validate: {
                  validator: function (value) {
                    // تحقق من أن عدد الكلمات لا يزيد عن 10 كلمات
                    return value.split(' ').length <= 4;
                  },
                  message: 'Title cannot exceed 7 words.'
                }
    
   },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  condition: { type: String, enum: ['new', 'used'], required: true },
  images: [{ type: String }],
  datePosted: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'sold'], default: 'active' },
  category: { type: String, required: true,
    enum: [
                'Cars',
                'Property',
                'Services',
                'Furniture',
                'Camping',
                'Gifts',
                'Contracting',
                'Family',
                'Animals',
                'Electronics'
              ],

   },
  subcategory: { type: String, required: true },
  sellerid: { type: String, required: true },
  sellername: { type: String, required: true },
});

module.exports = mongoose.model('newitemCollection', itemSchema);


// const mongoose = require('mongoose');

// const itemSchema = new mongoose.Schema({
//     title: { type: String, required: true ,
//         validate: {
//             validator: function (value) {
//               // تحقق من أن عدد الكلمات لا يزيد عن 10 كلمات
//               return value.split(' ').length <= 4;
//             },
//             message: 'Title cannot exceed 7 words.'
//           }
//     },  // عنوان الإعلان
//     description: { type: String, required: true },  // الوصف
//     price: { type: Number, required: true },  // السعر
//     location: { type: String, required: true },  // الموقع
    
//     ////////important/////////
//     condition: { type: String, enum: ['new', 'used'], required: true },  // حالة المنتج (جديد أو مستعمل)
//     images: [{ type: String }],  // روابط الصور
//     datePosted: { type: Date, default: Date.now },  // تاريخ النشر
//     status: { type: String, enum: ['active', 'sold',], default: 'active' },  // حالة الإعلان (نشط، تم بيعه، غير نشط)
//     category: {
//         type: String,
//         enum: [
//           'Cars',
//           'Property',
//           'Services',
//           'Furniture',
//           'Camping',
//           'Gifts',
//           'Contracting',
//           'Family',
//           'Animals',
//           'Electronics'
//         ],
//         required: true,
//       },
//       ////////cars 
//       brand: { type: String,  },         // العلامة التجارية
//       modelYear: { type: String, },     // سنة التصنيع
//       km: { type: String,},            // عدد الكيلومترات
//       engineCC: { type: String, },      // حجم المحرك
//       fuelType: { type: String,},      // نوع الوقود
//       transmission: { type: String, },  // ناقل الحركة
//       drivetrain: { type: String, },    // نظام الدفع
//       doors: { type: String, },         // عدد الأبواب
//       subcategory: { type: String, required: true },
//       sellername:{type:String,required:true},
//       sellernumber:{type:String,required:true},
//       sellerid:{type:String,required:true},



  
//   });
  

// // إنشاء موديل 
// module.exports = mongoose.model('itemCollection', itemSchema);
