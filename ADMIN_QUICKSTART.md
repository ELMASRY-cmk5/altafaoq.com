
# 🚀 دليل سريع - إدارة حساب الأدمن

## 📌 الملخص السريع

هذا النظام يوفر:
- ✅ نموذج طلب حساب أدمن
- ✅ لوحة إدارة الطلبات
- ✅ موافقة يدوية وآمنة
- ✅ تكامل كامل مع Firebase

---

## ⚡ البدء السريع

### الخطوة 1: إنشاء أول أدمن

افتح console في صفحة login.html واكتب:

```javascript
const users = [];
users.push({
  id: 'u_' + Date.now(),
  name: 'الأدمن الرئيسي',
  email: 'admin@altafaoq.com',
  studentNumber: 'admin',
  password: btoa('admin123'),
  role: 'admin',
  status: 'active',
  createdAt: new Date().toISOString()
});
localStorage.setItem('tf_users', JSON.stringify(users));
alert('✅ تم إنشاء الأدمن الأول!');
```

ثم سجل الدخول:
- **اسم المستخدم:** admin
- **كلمة المرور:** admin123

---

### الخطوة 2: إنشاء حسابات أدمن جديدة

1. **للمستخدم الجديد:**
   - زر الزيارة: `/admin-signup.html`
   - ملء النموذج بالبيانات
   - إرسال الطلب (سيكون حالته "pending")

2. **للأدمن الرئيسي:**
   - الدخول إلى: `/admin-requests.html`
   - مراجعة الطلبات المعلقة
   - الموافقة ✓ أو الرفض ✕

---

## 📊 الصفحات

| الصفحة | الرابط | الوصف |
|--------|--------|-------|
| طلب أدمن | `/admin-signup.html` | نموذج طلب إنشاء حساب |
| إدارة الطلبات | `/admin-requests.html` | للأدمن الرئيسي فقط |

---

## 🔐 بيانات تسجيل الدخول الأولى

```
Username: admin
Password: admin123
Role: admin
```

⚠️ **غيّر كلمة المرور بعد الدخول الأول!**

---

## 📱 رسائل الحالة

| الحالة | المعنى |
|-------|--------|
| pending | قيد الانتظار (لم توافق عليه بعد) |
| approved | موافق عليه (يمكنه تسجيل الدخول) |
| rejected | مرفوض |

---

## 💾 البيانات المحفوظة

### LocalStorage Keys:

```javascript
tf_admin_requests  // طلبات الأدمن
tf_users           // جدول المستخدمين
tf_current         // المستخدم الحالي
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: نسيت كلمة المرور
```javascript
// في console:
const users = JSON.parse(localStorage.getItem('tf_users'));
users[0].password = btoa('newpassword123');
localStorage.setItem('tf_users', JSON.stringify(users));
```

### المشكلة: أريد حذف طلب
```javascript
const requests = JSON.parse(localStorage.getItem('tf_admin_requests'));
const filtered = requests.filter(r => r.id !== 'request_id');
localStorage.setItem('tf_admin_requests', JSON.stringify(filtered));
```

### المشكلة: لا أستطيع رؤية admin-requests.html
- تأكد أنك أدمن (role: 'admin')
- تأكد من تسجيل الدخول في tf_current

---

## 🚀 الخطوات التالية

1. غيّر كلمة المرور الافتراضية
2. اختبر النموذج في admin-signup.html
3. وافق على الطلب في admin-requests.html
4. جرّب تسجيل الدخول بحساب أدمن جديد

---

## 📞 الدعم

اقرأ الشرح الكامل في: `FIREBASE_ADMIN_SETUP.js`

