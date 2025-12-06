// ============================================================================
// 🔥 نظام Firebase + إدارة حسابات الأدمن — التفوق
// ============================================================================

// 1. إعدادات Firebase
// ─────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBtS52bC8UEZ4EG4qK3tk7jV7iF1bPRTx8",
  authDomain: "altafaouq.firebaseapp.com",
  projectId: "altafaouq",
  storageBucket: "altafaouq.firebasestorage.app",
  messagingSenderId: "125346827754",
  appId: "1:125346827754:web:4286d194fa05094fe4b693",
  measurementId: "G-PNQS7VTSHT"
};

// الاستخدام:
import { initializeApp } from "firebase/app";
const app = initializeApp(firebaseConfig);


// 2. خطوات إنشاء حساب أدمن
// ─────────────────────────────────────────────────────────────────────────

✅ خطوة 1: الطالب يزور صفحة طلب حساب أدمن
   → URL: /admin-signup.html
   → يملأ نموذج به البيانات التالية:
     - الاسم الكامل
     - البريد الإلكتروني
     - رقم الهاتف
     - اسم المستخدم (لتسجيل الدخول)
     - كلمة المرور
     - المؤهل التعليمي
     - التخصص
     - سنوات الخبرة
     - السبب (لماذا تريد حساب أدمن)

✅ خطوة 2: النظام يحفظ الطلب
   → في Firebase: مجموعة "admin_requests"
   → في LocalStorage: "tf_admin_requests"
   → الحالة الأولية: "pending" (قيد الانتظار)

✅ خطوة 3: الأدمن الرئيسي يراجع الطلبات
   → URL: /admin-requests.html
   → يرى إحصائيات الطلبات
   → يمكنه الموافقة أو الرفض أو الحذف

✅ خطوة 4: الموافقة على الطلب
   → يتغير الحالة من "pending" → "approved"
   → يتم إنشاء حساب تلقائي في جدول Users
   → role: "admin"
   → status: "active"

✅ خطوة 5: الأدمن الجديد يسجل الدخول
   → في صفحة login.html
   → يدخل اسم المستخدم وكلمة المرور
   → ينتقل إلى /admin.html


// 3. هيكل قاعدة البيانات في Firebase
// ─────────────────────────────────────────────────────────────────────────

Collection: admin_requests
├── Document: {requestId}
│   ├── fullName: "أحمد محمد علي" (string)
│   ├── email: "admin@example.com" (string)
│   ├── phone: "01012345678" (string)
│   ├── username: "admin_user" (string)
│   ├── password: "base64_encoded" (string) ⚠️ غير آمن للإنتاج
│   ├── qualification: "bsc/master/phd" (string)
│   ├── specialization: "رياضيات" (string)
│   ├── experience: 5 (number)
│   ├── reason: "أريد إدارة المنصة" (string)
│   ├── status: "pending/approved/rejected" (string)
│   ├── createdAt: timestamp
│   └── role: "admin_pending" (string)

Collection: users
├── Document: {userId}
│   ├── name: "أحمد محمد علي"
│   ├── email: "admin@example.com"
│   ├── studentNumber: "admin_user" (اسم المستخدم)
│   ├── password: "encoded_password" ⚠️
│   ├── role: "admin"
│   ├── status: "active"
│   └── createdAt: timestamp


// 4. LocalStorage Keys
// ─────────────────────────────────────────────────────────────────────────

tf_admin_requests: [
  {
    id: "auto_id_from_firebase",
    fullName: "أحمد محمد",
    email: "admin@example.com",
    phone: "01012345678",
    username: "admin_user",
    qualification: "master",
    specialization: "رياضيات",
    experience: 5,
    reason: "...",
    status: "pending",
    createdAt: "2024-12-06T10:00:00Z"
  }
]

tf_users: [
  {
    id: "u_1733538000000",
    name: "أحمد محمد",
    email: "admin@example.com",
    studentNumber: "admin_user",
    password: "encoded...",
    role: "admin",
    status: "active",
    createdAt: "2024-12-06T10:05:00Z"
  }
]

tf_current: {
  id: "u_1733538000000",
  name: "أحمد محمد",
  studentNumber: "admin_user",
  role: "admin"
}


// 5. الصفحات المضافة
// ─────────────────────────────────────────────────────────────────────────

📄 admin-signup.html
   └─ نموذج طلب حساب أدمن
      • التحقق من صحة البيانات
      • حفظ في Firebase + LocalStorage
      • رسائل خطأ واضحة
      • تحويل تلقائي إلى login بعد النجاح

📄 admin-requests.html
   └─ لوحة إدارة طلبات الأدمن
      • عرض الإحصائيات
      • عرض الطلبات المعلقة
      • أزرار الموافقة/الرفض/الحذف
      • عرض تاريخ الطلب والتفاصيل

📄 firebase-setup.js (هذا الملف)
   └─ شرح شامل للنظام


// 6. كيفية الاستخدام في admin.html
// ─────────────────────────────────────────────────────────────────────────

// إضافة تبويب جديد في admin.html:

<button data-tab="admin-requests" class="tab-button">🆕 طلبات الأدمن</button>

<div id="admin-requests" class="tab-content">
  <h3>طلبات إنشاء حسابات أدمن جديدة</h3>
  <div id="adminRequestsList"></div>
</div>

// في JavaScript:
if(tab === 'admin-requests') {
  renderAdminRequests();
}

function renderAdminRequests() {
  const requests = JSON.parse(localStorage.getItem('tf_admin_requests')||'[]');
  const pending = requests.filter(r=>r.status==='pending');
  
  const list = document.getElementById('adminRequestsList');
  list.innerHTML = pending.map(r=>`
    <div class="admin-request-card">
      <h4>${r.fullName}</h4>
      <p>البريد: ${r.email}</p>
      <p>الهاتف: ${r.phone}</p>
      <p>المؤهل: ${r.qualification}</p>
      <button onclick="approveAdmin('${r.id}')">✓ موافقة</button>
      <button onclick="rejectAdmin('${r.id}')">✕ رفض</button>
    </div>
  `).join('');
}


// 7. إجراء الموافقة على طلب أدمن
// ─────────────────────────────────────────────────────────────────────────

function approveAdmin(requestId) {
  const requests = JSON.parse(localStorage.getItem('tf_admin_requests')||'[]');
  const request = requests.find(r=>r.id===requestId);
  
  if(request) {
    // 1. تغيير الحالة
    request.status = 'approved';
    localStorage.setItem('tf_admin_requests', JSON.stringify(requests));
    
    // 2. إضافة إلى جدول المستخدمين
    const users = JSON.parse(localStorage.getItem('tf_users')||'[]');
    users.push({
      id: 'u_'+Date.now(),
      name: request.fullName,
      email: request.email,
      studentNumber: request.username,
      password: request.password, // ⚠️ encrypted
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('tf_users', JSON.stringify(users));
    
    // 3. إرسال إشعار (اختياري)
    sendApprovalEmail(request.email, request.username);
    
    alert('✅ تمت الموافقة! يمكن للمستخدم الآن تسجيل الدخول');
  }
}


// 8. خطوات تسجيل الدخول للأدمن الجديد
// ─────────────────────────────────────────────────────────────────────────

1. زيارة /login.html
2. اختيار "دخول المدير"
3. إدخال:
   - اسم المدير: (نفس username من الطلب)
   - كلمة المرور: (نفس كلمة المرور المدخلة)
4. النقر على "دخول المدير"
5. النظام يتحقق من البيانات في جدول tf_users
6. إذا كانت صحيحة → ينتقل إلى /admin.html
7. يظهر اسم الأدمن الجديد في لوحة التحكم


// 9. المزايا والأمان
// ─────────────────────────────────────────────────────────────────────────

✅ المزايا:
  • نظام طلب سهل وواضح
  • موافقة يدوية من الأدمن الرئيسي
  • حفظ في Firebase + LocalStorage
  • إحصائيات واضحة للطلبات
  • واجهة سهلة الاستخدام

⚠️ تحسينات الأمان المقترحة:
  • استخدام Firebase Authentication (بدلاً من كلمات مرور محفوظة)
  • تشفير كلمات المرور (bcrypt)
  • إضافة Two-Factor Authentication (2FA)
  • تسجيل جميع التغييرات (audit log)
  • تحديد صلاحيات لكل أدمن (roles/permissions)
  • إرسال رسائل بريد إلكترونية للموافقة


// 10. مثال كامل - إنشاء أول أدمن
// ─────────────────────────────────────────────────────────────────────────

// في console في صفحة login.html:

const users = JSON.parse(localStorage.getItem('tf_users')||'[]');
users.push({
  id: 'u_' + Date.now(),
  name: 'الأدمن الرئيسي',
  email: 'admin@altafaoq.com',
  studentNumber: 'admin',
  password: btoa('admin123'), // Base64 encoded
  role: 'admin',
  status: 'active',
  createdAt: new Date().toISOString()
});
localStorage.setItem('tf_users', JSON.stringify(users));

// ثم:
// اسم المستخدم: admin
// كلمة المرور: admin123
// سجل الدخول → ستدخل الآن إلى /admin.html


// 11. النقاط التالية
// ─────────────────────────────────────────────────────────────────────────

→ إضافة Firebase Cloud Functions للموافقة التلقائية
→ إرسال رسائل بريد إلكترونية عند الموافقة
→ تحديد صلاحيات مختلفة (أدمن كامل، أدمن جزئي، معلم إلخ)
→ إضافة سجل تدقيق (audit log)
→ تحسين الأمان باستخدام Firebase Auth


// ============================================================================
// تم إنشاء النظام بنجاح! ✨
// ============================================================================
