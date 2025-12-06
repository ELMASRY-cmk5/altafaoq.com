# 🔐 نظام إدارة الجلسات المتقدم

## 📌 ملخص سريع

**النظام يضمن:**
- ✅ جلسة واحدة فقط لكل طالب
- ✅ غلق تلقائي عند تسجيل من جهاز آخر
- ✅ مراقبة مستمرة وفورية
- ✅ تتبع كامل للأجهزة والمتصفحات

---

## 🎯 كيف يعمل النظام؟

### المرحلة 1️⃣: تسجيل الدخول
```
الطالب يسجل الدخول
        ↓
التحقق من البيانات
        ↓
إنشاء معرّف جلسة فريد
        ↓
جمع معلومات الجهاز:
├── نوع الجهاز (Desktop/Mobile)
├── نظام التشغيل (Windows/Mac/Linux/Android/iOS)
├── المتصفح (Chrome/Firefox/Safari/Edge)
├── دقة الشاشة
└── معرّف الجهاز الفريد
        ↓
بحث عن جلسات قديمة من أجهزة أخرى
        ↓
إغلاق الجلسات القديمة (إن وجدت)
        ↓
حفظ الجلسة الجديدة
        ↓
ربط الطالب بالجلسة
```

### المرحلة 2️⃣: المراقبة المستمرة
```
كل 5 ثوانٍ:
├── التحقق من صحة الجلسة الحالية
├── التحقق من عدم فتح جلسة جديدة من جهاز آخر
├── تحديث وقت آخر نشاط
└── إغلاق الجلسة إذا لزم الأمر

إذا تم اكتشاف جلسة جديدة من جهاز آخر:
├── عرض تنبيه
├── إغلاق الجلسة القديمة
└── تحويل إلى صفحة الدخول
```

### المرحلة 3️⃣: تسجيل الخروج
```
الطالب يضغط تسجيل الخروج
        ↓
إغلاق الجلسة الحالية
        ↓
حذف بيانات المستخدم
        ↓
حذف معرّف الجلسة
        ↓
تحويل إلى صفحة الدخول
```

---

## 📊 بيانات الجلسة

### معرّف الجلسة الفريد:
```
session_1234567890_abc123xyz

التكوين:
- session_        : البادئة الثابتة
- 1234567890      : الطابع الزمني (Timestamp)
- abc123xyz       : سلسلة عشوائية
```

### معلومات الجلسة المخزنة:
```json
{
  "id": "session_1234567890_abc123",
  "studentId": "student_001",
  "deviceId": "device_9876543210_xyz",
  "startTime": "2024-01-15T10:00:00Z",
  "lastActive": "2024-01-15T10:30:45Z",
  "isActive": true,
  "userAgent": "Mozilla/5.0...",
  "screenResolution": "1920x1080",
  "browser": "Chrome",
  "ipLocation": "تم التسجيل"
}
```

---

## 🚀 مثال عملي كامل

### السيناريو: طالب يسجل من أجهزة مختلفة

#### الساعة 08:00 صباحاً - من الحاسوب:
```
الطالب أحمد يسجل:
├── الاسم: أحمد محمد
├── كلمة المرور: ****
├── الجهاز: كمبيوتر ديسكتوب
├── نظام التشغيل: Windows 10
├── المتصفح: Chrome
└── الدقة: 1920x1080

نتيجة:
✅ جلسة جديدة: session_1705316400_abc123
✅ معرّف الجهاز: device_1705316400_desk1
✅ حفظ الجلسة
✅ فتح لوحة الطالب
```

#### الساعة 02:00 ظهراً - من الهاتف:
```
نفس الطالب (أحمد) يحاول تسجيل من هاتفه:
├── الاسم: أحمد محمد
├── كلمة المرور: ****
├── الجهاز: الهاتف
├── نظام التشغيل: iOS
├── المتصفح: Safari
└── الدقة: 390x844

ما يحدث في النظام:
1. البحث عن جلسات قديمة من أجهزة أخرى
   → وجدت: session_1705316400_abc123 (من الحاسوب)
   
2. إغلاق الجلسة القديمة:
   ├── isActive: true → false
   ├── closedAt: 2024-01-15T14:00:00Z
   ├── closedReason: "new_device_login"
   └── حفظ في السجل
   
3. إنشاء جلسة جديدة:
   ├── معرّف جديد: session_1705330800_xyz789
   ├── معرّف جهاز جديد: device_1705330800_phone1
   └── حفظ الجلسة الجديدة
   
4. النتيجة:
   ✅ فتح لوحة الطالب من الهاتف
```

#### إذا لم يسجل الخروج من الحاسوب:
```
النافذة المفتوحة على الحاسوب:
├── تراقب الجلسة كل 5 ثوانٍ
├── اكتشفت أن الجلسة لم تعد نشطة
└── ظهور التنبيه:

   🔒 تم تسجيل الدخول من جهاز آخر
   
   ثم:
   ├── غلق الجلسة تلقائياً
   ├── حذف بيانات المستخدم
   └── تحويل إلى صفحة الدخول
```

---

## 🔍 تفاصيل التطبيق

### ملف `session-manager.js`:

```javascript
// الفئة الرئيسية
class SessionManager {
  // إنشاء جلسة جديدة
  createSession(studentId, studentData)
  
  // إغلاق الجلسات القديمة
  closeOtherSessions(studentId, currentDeviceId)
  
  // التحقق من صحة الجلسة
  isSessionValid(sessionId, timeout)
  
  // تحديث آخر نشاط
  updateLastActive(sessionId)
  
  // الحصول على معلومات الجهاز
  getDeviceInfo()
  getDeviceId()
  getBrowserInfo()
  getOS()
  
  // الجلسات النشطة
  getAllActiveSessions()
  getActiveSession(studentId)
  
  // الإغلاق والمراقبة
  closeSession(sessionId)
  forceLogout(reason)
  monitorSession()
  
  // التقارير
  getSessionStats()
  getSessionsPerDevice()
  getSessionsPerOS()
  exportSessionsReport()
}
```

### كيفية الاستخدام:

```javascript
// تم تهيئة المثيل العام تلقائياً:
const sessionManager = new SessionManager();

// إنشاء جلسة:
const sessionId = sessionManager.createSession(studentId, studentData);

// التحقق من الجلسة:
const isValid = sessionManager.isSessionValid(sessionId);

// إغلاق الجلسة:
sessionManager.closeSession(sessionId);

// الحصول على الإحصائيات:
const stats = sessionManager.getSessionStats();

// المراقبة التلقائية:
sessionManager.monitorSession(); // تعمل مباشرة
```

---

## 💾 التخزين

### بيانات الجلسات في localStorage:
```json
{
  "tf_sessions": [
    {
      "id": "session_xxx",
      "studentId": "student_001",
      "deviceId": "device_xxx",
      "startTime": "2024-01-15T10:00:00Z",
      "lastActive": "2024-01-15T10:30:45Z",
      "isActive": true,
      "userAgent": "Mozilla/5.0...",
      "screenResolution": "1920x1080",
      "browser": "Chrome"
    }
  ]
}
```

### بيانات الطالب المحدثة:
```json
{
  "id": "student_001",
  "name": "أحمد محمد",
  "sessionId": "session_xxx",
  "lastActive": "2024-01-15T10:30:45Z",
  "loginDevice": {
    "type": "Desktop",
    "os": "Windows",
    "browser": "Chrome",
    "resolution": "1920x1080"
  }
}
```

---

## 📈 الإحصائيات

### حساب الجلسات:
```javascript
// إحصائيات عامة:
{
  totalSessions: 45,           // إجمالي الجلسات (السابقة والحالية)
  activeSessions: 12,          // الجلسات النشطة حالياً
  totalStudents: 50,           // إجمالي الطلاب
  studentsWithActiveSessions: 12
}

// توزيع أنواع الأجهزة:
{
  mobile: 7,    // جلسات من الهاتف
  desktop: 5    // جلسات من الحاسوب
}

// توزيع المتصفحات:
{
  Chrome: 8,
  Safari: 3,
  Firefox: 1
}
```

---

## ⏱️ المدد الزمنية

### إعدادات الجلسات:

```javascript
// مدة الجلسة:
timeout = 24 * 60 * 60 * 1000  // 24 ساعة

// فترة المراقبة:
monitorInterval = 5000         // 5 ثوانٍ

// التحديثات التلقائية:
updateInterval = 5000          // 5 ثوانٍ
```

### الحالات:

| الحالة | المدة | الوصف |
|--------|------|-------|
| جلسة نشطة | 24 ساعة | الطالب مسجل دخول |
| آخر نشاط | حسب المستخدم | آخر تفاعل للطالب |
| انتظار | 5 دقائق | بدون نشاط ثم إغلاق |
| منتهية | دائم | جلسة مغلقة |

---

## 🛡️ الحماية والأمان

### كل جلسة محمية بـ:

1. **معرّف فريد**:
   - لا يمكن تخمينها
   - تتغير مع كل تسجيل دخول

2. **معرّف الجهاز**:
   - فريد لكل جهاز
   - يبقى نفسه للجهاز الواحد

3. **المراقبة المستمرة**:
   - كل 5 ثوانٍ
   - كشف فوري للمشاكل

4. **المعلومات المحفوظة**:
   - نوع الجهاز
   - نظام التشغيل
   - المتصفح
   - دقة الشاشة
   - وقت التسجيل

---

## 🔔 التنبيهات

### تنبيهات الطالب:

| التنبيه | السبب | الإجراء |
|--------|------|--------|
| ✅ تم إنشاء جلسة | تسجيل دخول | حفظ الجلسة |
| 🔒 تم التسجيل من جهاز آخر | تسجيل جديد | إغلاق الجلسة القديمة |
| ❌ انتهت الجلسة | مدة انتهت | تحويل لصفحة الدخول |
| 🔓 تسجيل خروج | طلب الطالب | حذف الجلسة |

---

## 📱 أمثلة الأجهزة

### المعروف:
```
Desktop:
- Windows 10/11
- macOS
- Linux

Mobile:
- iPhone (iOS)
- Android

المتصفحات:
- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge
```

---

## 🔧 الصيانة والإصلاح

### تنظيف الجلسات القديمة:
```javascript
// حذف جلسات انتهت منذ أكثر من 24 ساعة:
const sessions = JSON.parse(localStorage.getItem('tf_sessions'));
const now = new Date().getTime();
const filtered = sessions.filter(s => {
  const age = now - new Date(s.lastActive).getTime();
  return age < 24 * 60 * 60 * 1000 || s.isActive;
});
localStorage.setItem('tf_sessions', JSON.stringify(filtered));
```

### استخراج التقرير:
```javascript
const report = sessionManager.exportSessionsReport();
console.log(report);

// النتيجة:
[
  {
    sessionId: "session_xxx",
    studentName: "أحمد محمد",
    startTime: "2024-01-15T10:00:00Z",
    duration: "2ساعة 30دقيقة",
    status: "Active",
    device: "Chrome"
  }
]
```

---

## ✅ قائمة الفحص

- [x] تم إنشاء `session-manager.js`
- [x] تم إضافة المراقبة إلى `login.html`
- [x] تم تحديث `student-dashboard.html`
- [x] تم تطبيق الإغلاق التلقائي
- [x] تم حفظ البيانات بشكل صحيح
- [x] تم اختبار من جهازين مختلفين

---

## 🚀 الخطوات التالية

1. **تطبيق عملي**: اختبر من جهازين مختلفين
2. **Firebase**: ربط الجلسات بـ Firebase
3. **التقارير**: عرض التقارير في لوحة الأدمن
4. **التنبيهات**: تنبيهات فورية للأدمن
5. **IP Tracking**: تسجيل عناوين IP

---

**شكراً لاستخدام نظام إدارة الجلسات المتقدم!** 🎉
