# 🔐 دليل إعداد نظام Firebase الآمن للأدمن

## الخطوة 1: إنشاء مجموعات Firestore

اذهب إلى [Firebase Console](https://console.firebase.google.com) وأنشئ المجموعات التالية في قاعدة بيانات Firestore:

### 1️⃣ مجموعة `admins`
تحتوي على بيانات المدراء

**مثال على البيانات:**
```json
{
  "id": "admin_001",
  "name": "الأدمن الرئيسي",
  "email": "admin@altafaoq.com",
  "phone": "01090396747",
  "password": "MTA5MDkwOTA=",  // Base64 مشفر
  "role": "admin",
  "status": "active",
  "permissions": ["all"],
  "createdAt": "2025-12-06T10:00:00.000Z",
  "lastLogin": null,
  "loginAttempts": 0,
  "isBlocked": false
}
```

### 2️⃣ مجموعة `admin_logs`
تسجيل جميع إجراءات الأدمن

**مثال على البيانات:**
```json
{
  "adminId": "admin_001",
  "action": "login",
  "description": "تسجيل دخول ناجح",
  "timestamp": "2025-12-06T10:00:00.000Z",
  "ipAddress": "192.168.1.1"
}
```

## الخطوة 2: تطبيق قوانين الأمان

اذهب إلى **Firestore Database** → **Rules** وأضف القوانين التالية:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // مجموعة admins - للأدمنز فقط
    match /admins/{document=**} {
      allow read: if request.auth != null && 
                     request.auth.customClaims.role == 'admin';
      allow write: if request.auth != null && 
                      request.auth.customClaims.role == 'admin';
    }
    
    // مجموعة admin_logs - للقراءة فقط من الأدمنز
    match /admin_logs/{document=**} {
      allow read: if request.auth != null && 
                     request.auth.customClaims.role == 'admin';
      allow write: if false; // منع الكتابة من العملاء
    }
    
    // مجموعات أخرى
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /courses/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.customClaims.role == 'admin';
    }
  }
}
```

## الخطوة 3: تفعيل Firebase Authentication

1. اذهب إلى **Authentication** → **Sign-in method**
2. فعّل **Email/Password**
3. اتبع الخطوات لإنشاء حسابات

## الخطوة 4: الخطوات التالية

### في لوحة الأدمن:
```javascript
// دخول الأدمن
const result = await window.FirebaseAdmin.verify('01090396747', '10909090');
console.log('✅ تم الدخول:', result);

// إضافة أدمن جديد
const newAdmin = await window.FirebaseAdmin.create({
  name: 'أدمن جديد',
  email: 'newadmin@altafaoq.com',
  phone: '01001234567',
  password: 'securePassword123'
});

// الحصول على قائمة الأدمنز
const admins = await window.FirebaseAdmin.getList();
console.log('👥 الأدمنز:', admins);

// تحديث بيانات الأدمن
await window.FirebaseAdmin.update('admin_001', {
  name: 'الأدمن المحدث'
});

// حذف أدمن
await window.FirebaseAdmin.delete('admin_002');
```

## 🔒 ميزات الأمان

✅ **حفظ آمن** - البيانات محفوظة في Firebase Firestore
✅ **تشفير** - كلمات المرور مشفرة (Base64)
✅ **تتبع الدخول** - تسجيل آخر تسجيل دخول
✅ **حماية من الهجمات** - قفل الحساب بعد محاولات فاشلة
✅ **التسجيل** - تسجيل جميع الإجراءات
✅ **صلاحيات** - نظام صلاحيات مرن
✅ **منع الحذف** - عدم السماح بحذف الأدمن الرئيسي

## ⚠️ ملاحظات أمنية هامة

1. **في الإنتاج**: استخدم bcrypt أو Argon2 بدلاً من Base64
2. **استخدم HTTPS فقط** في الإنتاج
3. **Two-Factor Authentication** - أضف 2FA للأدمنز
4. **Rate Limiting** - حدّ محاولات الدخول
5. **VPN/Firewall** - اقصر الوصول للعناوين المصرح بها

## 📞 الدعم والمساعدة

للمزيد من المعلومات:
- [توثيق Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**تم الإعداد بنجاح! 🎉**
