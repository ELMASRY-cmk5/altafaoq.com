// ✅ Firebase Admin Authentication System
// يتم حفظ بيانات الأدمن في Firebase Firestore بدلاً من localStorage
// هذا يوفر أمان أفضل ويمنع التلاعب بالبيانات

// Firebase Config (استخدم بيانات Firebase الخاصة بك)
const firebaseConfig = {
  apiKey: "AIzaSyBtS52bC8UEZ4EG4qK3tk7jV7iF1bPRTx8",
  authDomain: "altafaouq.firebaseapp.com",
  projectId: "altafaouq",
  storageBucket: "altafaouq.firebasestorage.app",
  messagingSenderId: "125346827754",
  appId: "1:125346827754:web:4286d194fa05094fe4b693",
  measurementId: "G-PNQS7VTSHT"
};

// إضافة بيانات الأدمن الافتراضي إلى Firebase
async function initAdminFirebase() {
  try {
    // تهيئة Firebase إذا لم تكن موجودة
    if (!window.firebase) {
      console.log('⚠️ Firebase SDK غير محمّل. يرجى تحميل Firebase SDK أولاً.');
      return false;
    }

    const db = firebase.firestore();
    const adminRef = db.collection('admins').doc('admin_001');
    const adminDoc = await adminRef.get();

    // تحقق من وجود الحساب
    if (!adminDoc.exists) {
      const adminData = {
        id: 'admin_001',
        name: 'الأدمن الرئيسي',
        email: 'admin@altafaoq.com',
        phone: '01090396747',
        password: btoa('10909090'), // تشفير Base64 (يفضل استخدام bcrypt في الإنتاج)
        role: 'admin',
        status: 'active',
        permissions: ['all'],
        createdAt: new Date().toISOString(),
        lastLogin: null,
        loginAttempts: 0,
        isBlocked: false
      };

      await adminRef.set(adminData);
      console.log('✅ تم إنشاء حساب الأدمن في Firebase');
      console.log('📱 الرقم: 01090396747');
      console.log('🔐 كلمة المرور: 10909090');
      return true;
    }

    console.log('ℹ️ حساب الأدمن موجود بالفعل في Firebase');
    return true;
  } catch (error) {
    console.error('❌ خطأ في Firebase:', error);
    return false;
  }
}

// التحقق من بيانات الدخول من Firebase
async function verifyAdminCredentials(phone, password) {
  try {
    if (!window.firebase) {
      throw new Error('Firebase SDK غير متاح');
    }

    const db = firebase.firestore();
    const adminsSnapshot = await db.collection('admins')
      .where('phone', '==', phone)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (adminsSnapshot.empty) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    const adminData = adminsSnapshot.docs[0].data();

    // التحقق من محاولات الدخول الفاشلة
    if (adminData.isBlocked) {
      throw new Error('الحساب مُقفّل مؤقتاً. يرجى المحاولة لاحقاً.');
    }

    // التحقق من كلمة المرور
    if (btoa(password) !== adminData.password) {
      // تحديث محاولات الدخول الفاشلة
      await db.collection('admins').doc(adminData.id).update({
        loginAttempts: (adminData.loginAttempts || 0) + 1,
        isBlocked: (adminData.loginAttempts || 0) >= 4 // قفل بعد 5 محاولات فاشلة
      });
      throw new Error('كلمة المرور غير صحيحة');
    }

    // تحديث آخر تسجيل دخول وإعادة تعيين محاولات الدخول
    await db.collection('admins').doc(adminData.id).update({
      lastLogin: new Date().toISOString(),
      loginAttempts: 0,
      isBlocked: false
    });

    // تسجيل العملية
    await logAdminAction(adminData.id, 'login', 'تسجيل دخول ناجح');

    return {
      id: adminData.id,
      name: adminData.name,
      phone: adminData.phone,
      role: adminData.role,
      permissions: adminData.permissions
    };
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
    throw error;
  }
}

// إضافة أدمن جديد
async function createAdmin(adminData) {
  try {
    if (!window.firebase) {
      throw new Error('Firebase SDK غير متاح');
    }

    // التحقق من الصلاحيات (يجب أن يكون الطالب أدمن)
    const currentUser = JSON.parse(localStorage.getItem('tf_current') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('لا توجد صلاحيات كافية');
    }

    const db = firebase.firestore();
    const newAdminId = 'admin_' + Date.now();

    const newAdmin = {
      id: newAdminId,
      name: adminData.name,
      email: adminData.email,
      phone: adminData.phone,
      password: btoa(adminData.password),
      role: 'admin',
      status: 'active',
      permissions: adminData.permissions || ['manage_students', 'manage_courses'],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      lastLogin: null,
      loginAttempts: 0,
      isBlocked: false
    };

    await db.collection('admins').doc(newAdminId).set(newAdmin);
    await logAdminAction(currentUser.id, 'create_admin', `إنشاء أدمن جديد: ${adminData.name}`);

    return { success: true, id: newAdminId };
  } catch (error) {
    console.error('❌ خطأ في إنشاء أدمن:', error);
    throw error;
  }
}

// تحديث بيانات الأدمن
async function updateAdmin(adminId, updates) {
  try {
    if (!window.firebase) {
      throw new Error('Firebase SDK غير متاح');
    }

    const currentUser = JSON.parse(localStorage.getItem('tf_current') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('لا توجد صلاحيات كافية');
    }

    const db = firebase.firestore();
    
    // إذا كان يتم تحديث كلمة المرور، قم بتشفيرها
    if (updates.password) {
      updates.password = btoa(updates.password);
    }

    updates.updatedAt = new Date().toISOString();
    updates.updatedBy = currentUser.id;

    await db.collection('admins').doc(adminId).update(updates);
    await logAdminAction(currentUser.id, 'update_admin', `تحديث بيانات الأدمن: ${adminId}`);

    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في تحديث الأدمن:', error);
    throw error;
  }
}

// حذف أدمن
async function deleteAdmin(adminId) {
  try {
    if (!window.firebase) {
      throw new Error('Firebase SDK غير متاح');
    }

    const currentUser = JSON.parse(localStorage.getItem('tf_current') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('لا توجد صلاحيات كافية');
    }

    // منع حذف الأدمن الرئيسي
    if (adminId === 'admin_001') {
      throw new Error('لا يمكن حذف الأدمن الرئيسي');
    }

    const db = firebase.firestore();
    await db.collection('admins').doc(adminId).delete();
    await logAdminAction(currentUser.id, 'delete_admin', `حذف الأدمن: ${adminId}`);

    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في حذف الأدمن:', error);
    throw error;
  }
}

// الحصول على قائمة الأدمنز
async function getAdminsList() {
  try {
    if (!window.firebase) {
      throw new Error('Firebase SDK غير متاح');
    }

    const currentUser = JSON.parse(localStorage.getItem('tf_current') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('لا توجد صلاحيات كافية');
    }

    const db = firebase.firestore();
    const adminsSnapshot = await db.collection('admins').get();
    
    return adminsSnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('❌ خطأ في الحصول على قائمة الأدمنز:', error);
    throw error;
  }
}

// تسجيل نشاط الأدمن
async function logAdminAction(adminId, action, description) {
  try {
    if (!window.firebase) return;

    const db = firebase.firestore();
    await db.collection('admin_logs').add({
      adminId: adminId,
      action: action,
      description: description,
      timestamp: new Date().toISOString(),
      ipAddress: await getClientIP()
    });
  } catch (error) {
    console.error('❌ خطأ في تسجيل الإجراء:', error);
  }
}

// الحصول على عنوان IP الخاص بالعميل
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
}

// Firebase Firestore Rules (ضعها في قسم Rules في Firebase Console)
const firebaseRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // مجموعة admins - للأدمنز فقط
    match /admins/{document=**} {
      allow read: if request.auth != null && request.auth.customClaims.role == 'admin';
      allow write: if request.auth != null && request.auth.customClaims.role == 'admin';
    }
    
    // مجموعة admin_logs - للقراءة فقط من الأدمنز
    match /admin_logs/{document=**} {
      allow read: if request.auth != null && request.auth.customClaims.role == 'admin';
      allow write: if false; // منع الكتابة من العملاء
    }
    
    // مجموعات أخرى - للقراءة العامة
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /students/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /courses/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.customClaims.role == 'admin';
    }
  }
}
`;

// تصدير الوظائف
window.FirebaseAdmin = {
  init: initAdminFirebase,
  verify: verifyAdminCredentials,
  create: createAdmin,
  update: updateAdmin,
  delete: deleteAdmin,
  getList: getAdminsList,
  logAction: logAdminAction,
  rules: firebaseRules
};

console.log('✅ نظام Firebase للأدمن محمّل بنجاح');
