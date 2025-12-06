// ============================================================================
// 🗄️ نظام التخزين والبيانات الشامل — منصة التفوق
// Firebase Collections + LocalStorage
// ============================================================================

// 1. إعدادات Firebase المحسّنة
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

// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);


// 2. بيانات الأدمن الافتراضية
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_ADMIN = {
  id: 'admin_001',
  name: 'الأدمن الرئيسي',
  email: 'admin@altafaoq.com',
  phone: '01090396747',
  studentNumber: 'admin_001',
  password: btoa('10909090'), // Base64: يجب تشفيرها بشكل آمن في الإنتاج
  role: 'admin',
  status: 'active',
  createdAt: new Date().toISOString(),
  permissions: ['all']
};

// حفظ الأدمن الافتراضي عند بدء التطبيق
function initializeDefaultAdmin() {
  const users = JSON.parse(localStorage.getItem('tf_users') || '[]');
  const adminExists = users.find(u => u.studentNumber === 'admin_001');
  
  if(!adminExists) {
    users.push(DEFAULT_ADMIN);
    localStorage.setItem('tf_users', JSON.stringify(users));
    console.log('✅ تم إضافة الأدمن الافتراضي');
  }
}


// 3. Collections في Firebase
// ─────────────────────────────────────────────────────────────────────────

/*
USERS Collection
├── Document: {userId}
│   ├── name: string
│   ├── email: string
│   ├── phone: string
│   ├── studentNumber: string
│   ├── password: encrypted_string (⚠️ ليس آمن)
│   ├── role: "student" | "admin" | "teacher"
│   ├── status: "active" | "inactive"
│   ├── createdAt: timestamp
│   ├── lastLogin: timestamp
│   └── profileImage: url

STUDENTS Collection
├── Document: {studentId}
│   ├── name: string
│   ├── email: string
│   ├── phone: string
│   ├── grade: number (1-3)
│   ├── schoolName: string
│   ├── joinedDate: timestamp
│   ├── lastActive: timestamp
│   └── metadata: {theme, language, etc}

COURSES Collection
├── Document: {courseId}
│   ├── name: string
│   ├── description: string
│   ├── subject: string
│   ├── grade: number
│   ├── teacher: string
│   ├── price: number
│   ├── image: url
│   ├── totalLessons: number
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

LESSONS Collection
├── Document: {lessonId}
│   ├── courseId: string
│   ├── title: string
│   ├── description: string
│   ├── videoUrl: url
│   ├── duration: number (seconds)
│   ├── order: number
│   ├── resources: [urls]
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

STUDENT_COURSES Collection (Many-to-Many)
├── Document: {enrollmentId}
│   ├── studentId: string
│   ├── courseId: string
│   ├── enrolledAt: timestamp
│   ├── progress: number (0-100%)
│   ├── lessonsCompleted: number
│   ├── sessionId: string
│   ├── lastAccessedAt: timestamp
│   └── status: "active" | "completed" | "abandoned"

ASSIGNMENTS Collection
├── Document: {assignmentId}
│   ├── courseId: string
│   ├── title: string
│   ├── description: string
│   ├── dueDate: timestamp
│   ├── maxScore: number
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

STUDENT_ASSIGNMENTS Collection
├── Document: {submissionId}
│   ├── studentId: string
│   ├── assignmentId: string
│   ├── submitted: boolean
│   ├── submittedAt: timestamp
│   ├── grade: number
│   ├── feedback: string
│   ├── fileUrl: url
│   └── status: "pending" | "graded" | "late"

EXAMS Collection
├── Document: {examId}
│   ├── courseId: string
│   ├── title: string
│   ├── description: string
│   ├── date: timestamp
│   ├── duration: number (minutes)
│   ├── maxScore: number
│   ├── totalQuestions: number
│   └── createdAt: timestamp

STUDENT_EXAMS Collection
├── Document: {examResultId}
│   ├── studentId: string
│   ├── examId: string
│   ├── grade: number
│   ├── totalGrade: number
│   ├── percentage: number
│   ├── completedAt: timestamp
│   ├── timeSpent: number (seconds)
│   └── answers: [answers_data]

SUBSCRIPTIONS Collection
├── Document: {subscriptionId}
│   ├── name: string
│   ├── description: string
│   ├── price: number
│   ├── duration: number (days)
│   ├── features: [features]
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

STUDENT_SUBSCRIPTIONS Collection
├── Document: {activeSubscriptionId}
│   ├── studentId: string
│   ├── subscriptionId: string
│   ├── startDate: timestamp
│   ├── expiryDate: timestamp
│   ├── status: "active" | "expired" | "cancelled"
│   └── autoRenew: boolean

ORDERS Collection
├── Document: {orderId}
│   ├── studentId: string
│   ├── items: [
│   │   ├── productId
│   │   ├── name
│   │   ├── price
│   │   └── quantity
│   │ ]
│   ├── subtotal: number
│   ├── shipping: number (always 90)
│   ├── total: number
│   ├── status: "pending" | "processing" | "shipped" | "delivered"
│   ├── shippingAddress: {
│   │   ├── governorate
│   │   ├── city
│   │   ├── address
│   │   ├── phone
│   │   └── notes
│   │ }
│   ├── paymentMethod: "vodafone_cash" | "cod"
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── estimatedDelivery: timestamp

SESSIONS Collection
├── Document: {sessionId}
│   ├── studentId: string
│   ├── startTime: timestamp
│   ├── endTime: timestamp (null if active)
│   ├── duration: number (seconds)
│   ├── device: "mobile" | "tablet" | "desktop"
│   ├── ipAddress: string
│   ├── browser: string
│   └── status: "active" | "closed"

AUDIT_LOG Collection
├── Document: {logId}
│   ├── userId: string
│   ├── action: string
│   ├── resource: string
│   ├── changes: object
│   ├── timestamp: timestamp
│   ├── ipAddress: string
│   └── status: "success" | "failed"
*/


// 4. LocalStorage Keys
// ─────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  // Users
  users: 'tf_users',
  current: 'tf_current',
  
  // Students
  students: 'tf_students',
  studentSessions: 'tf_student_sessions',
  
  // Courses & Learning
  courses: 'tf_courses',
  lessons: 'tf_lessons',
  studentCourses: 'tf_student_courses',
  
  // Grades & Assessments
  assignments: 'tf_assignments',
  studentAssignments: 'tf_student_assignments',
  exams: 'tf_exams',
  studentExams: 'tf_student_exams',
  
  // Subscriptions
  subscriptions: 'tf_subscriptions',
  studentSubscriptions: 'tf_student_subscriptions',
  
  // Store
  products: 'tf_products',
  cart: 'tf_cart',
  orders: 'tf_orders',
  
  // Admin
  adminRequests: 'tf_admin_requests',
  
  // Settings
  theme: 'tf_theme',
  language: 'tf_language'
};


// 5. نماذج البيانات
// ─────────────────────────────────────────────────────────────────────────

class Student {
  constructor(data = {}) {
    this.id = data.id || 's_' + Date.now();
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.grade = data.grade || 1;
    this.schoolName = data.schoolName || '';
    this.joinedDate = data.joinedDate || new Date().toISOString();
    this.lastActive = data.lastActive || new Date().toISOString();
    this.sessionId = data.sessionId || null;
    this.metadata = data.metadata || {theme: 'light', language: 'ar'};
  }
}

class Course {
  constructor(data = {}) {
    this.id = data.id || 'c_' + Date.now();
    this.name = data.name || '';
    this.description = data.description || '';
    this.subject = data.subject || '';
    this.grade = data.grade || 1;
    this.teacher = data.teacher || '';
    this.price = data.price || 0;
    this.image = data.image || '';
    this.totalLessons = data.totalLessons || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}

class Enrollment {
  constructor(data = {}) {
    this.id = data.id || 'e_' + Date.now();
    this.studentId = data.studentId || '';
    this.courseId = data.courseId || '';
    this.enrolledAt = data.enrolledAt || new Date().toISOString();
    this.progress = data.progress || 0;
    this.lessonsCompleted = data.lessonsCompleted || 0;
    this.sessionId = data.sessionId || 'sess_' + Date.now();
    this.lastAccessedAt = data.lastAccessedAt || new Date().toISOString();
    this.status = data.status || 'active';
  }
}

class Order {
  constructor(data = {}) {
    this.id = data.id || 'ord_' + Date.now();
    this.studentId = data.studentId || '';
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.shipping = 90; // ثابت دائماً
    this.total = data.total || (this.subtotal + 90);
    this.status = data.status || 'pending';
    this.shippingAddress = data.shippingAddress || {};
    this.paymentMethod = data.paymentMethod || 'cod';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.estimatedDelivery = data.estimatedDelivery || null;
  }
}

class Session {
  constructor(data = {}) {
    this.id = data.id || 'sess_' + Date.now();
    this.studentId = data.studentId || '';
    this.startTime = data.startTime || new Date().toISOString();
    this.endTime = data.endTime || null;
    this.duration = data.duration || 0;
    this.device = data.device || 'desktop';
    this.ipAddress = data.ipAddress || '';
    this.browser = data.browser || 'Unknown';
    this.status = data.status || 'active';
  }
}


// 6. وظائف التخزين
// ─────────────────────────────────────────────────────────────────────────

// الطلاب
async function saveStudent(student) {
  const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students) || '[]');
  const index = students.findIndex(s => s.id === student.id);
  
  if(index !== -1) {
    students[index] = student;
  } else {
    students.push(student);
  }
  
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  
  // حفظ في Firebase
  try {
    const docRef = await addDoc(collection(db, 'students'), student);
    console.log('✅ تم حفظ الطالب في Firebase:', docRef.id);
  } catch(err) {
    console.error('❌ خطأ في حفظ Firebase:', err);
  }
}

function getStudent(studentId) {
  const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.students) || '[]');
  return students.find(s => s.id === studentId);
}

// الكورسات
async function saveCourse(course) {
  const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.courses) || '[]');
  const index = courses.findIndex(c => c.id === course.id);
  
  if(index !== -1) {
    courses[index] = course;
  } else {
    courses.push(course);
  }
  
  localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
}

function getCourses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.courses) || '[]');
}

// الاشتراكات
async function enrollStudent(studentId, courseId) {
  const enrollment = new Enrollment({studentId, courseId});
  const enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.studentCourses) || '[]');
  enrollments.push(enrollment);
  localStorage.setItem(STORAGE_KEYS.studentCourses, JSON.stringify(enrollments));
  return enrollment;
}

function getStudentCourses(studentId) {
  const enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.studentCourses) || '[]');
  return enrollments.filter(e => e.studentId === studentId);
}

// الطلبات
async function createOrder(order) {
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  
  // حفظ في Firebase
  try {
    const docRef = await addDoc(collection(db, 'orders'), order);
    console.log('✅ تم حفظ الطلب في Firebase:', docRef.id);
  } catch(err) {
    console.error('❌ خطأ في حفظ Firebase:', err);
  }
}

function getStudentOrders(studentId) {
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
  return orders.filter(o => o.studentId === studentId);
}

// الجلسات
async function createSession(studentId) {
  const session = new Session({studentId});
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.studentSessions) || '[]');
  sessions.push(session);
  localStorage.setItem(STORAGE_KEYS.studentSessions, JSON.stringify(sessions));
  return session;
}

function getActiveSessions(studentId) {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.studentSessions) || '[]');
  return sessions.filter(s => s.studentId === studentId && s.status === 'active');
}

function closeSession(sessionId) {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.studentSessions) || '[]');
  const session = sessions.find(s => s.id === sessionId);
  
  if(session) {
    session.endTime = new Date().toISOString();
    session.duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
    session.status = 'closed';
    localStorage.setItem(STORAGE_KEYS.studentSessions, JSON.stringify(sessions));
  }
}

// الدرجات
function saveExamGrade(studentId, examId, grade, totalGrade) {
  const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.studentExams) || '[]');
  exams.push({
    id: 'exam_' + Date.now(),
    studentId,
    examId,
    grade,
    totalGrade,
    percentage: (grade / totalGrade * 100).toFixed(2),
    completedAt: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEYS.studentExams, JSON.stringify(exams));
}

function getStudentGrades(studentId) {
  const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.studentExams) || '[]');
  return exams.filter(e => e.studentId === studentId);
}


// 7. تهيئة البيانات الافتراضية
// ─────────────────────────────────────────────────────────────────────────

function initializeDefaultData() {
  initializeDefaultAdmin();
  
  // إضافة كورسات افتراضية إذا لم توجد
  const courses = getCourses();
  if(courses.length === 0) {
    const defaultCourses = [
      new Course({
        name: 'الرياضيات - الجبر',
        subject: 'الرياضيات',
        grade: 1,
        teacher: 'أ.د أحمد محمد',
        price: 150,
        totalLessons: 12,
        description: 'دورة شاملة في الجبر للصف الأول الثانوي'
      }),
      new Course({
        name: 'الفيزياء - الميكانيكا',
        subject: 'الفيزياء',
        grade: 1,
        teacher: 'أ.د علي حسن',
        price: 150,
        totalLessons: 10,
        description: 'دورة الميكانيكا من الصفر للثانوية'
      }),
      new Course({
        name: 'الكيمياء - المواد',
        subject: 'الكيمياء',
        grade: 1,
        teacher: 'د. فاطمة أحمد',
        price: 150,
        totalLessons: 15,
        description: 'دراسة المواد والعناصر الكيميائية'
      })
    ];
    
    defaultCourses.forEach(course => saveCourse(course));
    console.log('✅ تم إضافة الكورسات الافتراضية');
  }
}


// 8. نقاط الاستخدام
// ─────────────────────────────────────────────────────────────────────────

// عند بدء التطبيق:
document.addEventListener('DOMContentLoaded', () => {
  initializeDefaultData();
  
  // إنشاء جلسة جديدة للطالب المسجل
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.current) || 'null');
  if(current && current.role === 'student') {
    createSession(current.id);
  }
});

// عند إغلاق الصفحة:
window.addEventListener('beforeunload', () => {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.current) || 'null');
  if(current && current.role === 'student') {
    const sessions = getActiveSessions(current.id);
    sessions.forEach(session => closeSession(session.id));
  }
});


// 9. Firebase Firestore Rules (يجب نسخها إلى Firebase Console)
// ─────────────────────────────────────────────────────────────────────────

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /students/{studentId} {
      allow read, write: if request.auth.uid == studentId;
    }
    
    // Allow public read of courses
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
*/


// 10. تصدير الوظائف
// ─────────────────────────────────────────────────────────────────────────

window.StudentDataManager = {
  saveStudent,
  getStudent,
  saveCourse,
  getCourses,
  enrollStudent,
  getStudentCourses,
  createOrder,
  getStudentOrders,
  createSession,
  getActiveSessions,
  closeSession,
  saveExamGrade,
  getStudentGrades,
  initializeDefaultData,
  STORAGE_KEYS,
  Classes: {Student, Course, Enrollment, Order, Session}
};

console.log('✅ نظام التخزين والبيانات جاهز');
