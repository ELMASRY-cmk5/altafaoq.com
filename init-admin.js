// ✅ إضافة حساب الأدمن الافتراضي
// هذا الملف يضيف بيانات الأدمن إلى localStorage
// قم بتشغيله مرة واحدة فقط

(function() {
  // تحقق مما إذا كان الحساب موجود بالفعل
  const users = JSON.parse(localStorage.getItem('tf_users') || '[]');
  const adminExists = users.some(u => u.phone === '01090396747');

  if (!adminExists) {
    // إضافة حساب الأدمن الرئيسي
    const adminUser = {
      id: 'admin_001',
      name: 'الأدمن الرئيسي',
      email: 'admin@altafaoq.com',
      phone: '01090396747',
      studentNumber: 'admin_001',
      password: btoa('10909090'), // تشفير Base64 للرقم الأصلي: "MTA5MDkwOTA="
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      permissions: ['all']
    };

    users.push(adminUser);
    localStorage.setItem('tf_users', JSON.stringify(users));

    console.log('✅ تم إضافة حساب الأدمن بنجاح!');
    console.log('📱 الرقم: 01090396747');
    console.log('🔐 كلمة المرور: 10909090');
    console.log('📊 البيانات المحفوظة في localStorage تحت: tf_users');
  } else {
    console.log('⚠️ حساب الأدمن موجود بالفعل');
  }
})();
