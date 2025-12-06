
// نظام التخزين الحقيقي باستخدام Firebase Firestore

// Firebase setup for browser
// يجب أن يكون لديك <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
// و <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
// وملف firebase-config.js يحتوي على window.db

const db = window.db;
const {
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc, setDoc, query, where
} = window.firebase.firestore;

class AdvancedStorageSystem {
  // إضافة طالب جديد
  async addStudent(studentData) {
    try {
      const newStudent = {
        id: 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...studentData,
        createdAt: new Date().toISOString(),
        sessionId: null,
        lastActive: new Date().toISOString()
      };
      await setDoc(doc(db, 'tf_students', newStudent.id), newStudent);
      return { success: true, studentId: newStudent.id, student: newStudent };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // البحث عن طالب
  async findStudent(email, phone) {
    try {
      const q = query(collection(db, 'tf_students'),
        where('email', '==', email)
      );
      const snapshot = await getDocs(q);
      let student = null;
      snapshot.forEach(doc => { student = doc.data(); });
      if (!student && phone) {
        const q2 = query(collection(db, 'tf_students'),
          where('phone', '==', phone)
        );
        const snap2 = await getDocs(q2);
        snap2.forEach(doc => { student = doc.data(); });
      }
      return student;
    } catch (e) {
      return null;
    }
  }

  // جلب جميع الطلاب
  async getAllStudents() {
    const snapshot = await getDocs(collection(db, 'tf_students'));
    return snapshot.docs.map(doc => doc.data());
  }

  // إضافة كورس
  async addCourse(courseData) {
    try {
      const newCourse = {
        id: 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...courseData,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'tf_courses', newCourse.id), newCourse);
      return { success: true, courseId: newCourse.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // جلب الكورسات
  async getCourses() {
    const snapshot = await getDocs(collection(db, 'tf_courses'));
    return snapshot.docs.map(doc => doc.data());
  }

  // حذف كورس
  async deleteCourse(courseId) {
    try {
      await deleteDoc(doc(db, 'tf_courses', courseId));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // إضافة أدمن
  async addAdmin(adminData) {
    try {
      const newAdmin = {
        id: 'admin_' + Date.now(),
        ...adminData,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'tf_admins', newAdmin.id), newAdmin);
      return { success: true, adminId: newAdmin.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // جلب الأدمنز
  async getAdmins() {
    const snapshot = await getDocs(collection(db, 'tf_admins'));
    return snapshot.docs.map(doc => doc.data());
  }

  // Lessons Management
  async addLesson(lesson) {
    try {
      lesson.id = 'l_' + Date.now();
      lesson.createdAt = new Date().toISOString();
      await setDoc(doc(db, 'tf_lessons', lesson.id), lesson);
      return { success: true, id: lesson.id };
    } catch (e) {
      return { success: false, message: 'خطأ في إضافة الدرس: ' + e.message };
    }
  }

  async getLessons() {
    const snapshot = await getDocs(collection(db, 'tf_lessons'));
    return snapshot.docs.map(doc => doc.data());
  }

  async deleteLesson(lessonId) {
    try {
      await deleteDoc(doc(db, 'tf_lessons', lessonId));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'خطأ في حذف الدرس: ' + e.message };
    }
  }

  // Assignments Management
  async addAssignment(assignment) {
    try {
      assignment.id = 'a_' + Date.now();
      assignment.createdAt = new Date().toISOString();
      await setDoc(doc(db, 'tf_assignments', assignment.id), assignment);
      return { success: true, id: assignment.id };
    } catch (e) {
      return { success: false, message: 'خطأ في إضافة الواجب: ' + e.message };
    }
  }

  async getAssignments() {
    const snapshot = await getDocs(collection(db, 'tf_assignments'));
    return snapshot.docs.map(doc => doc.data());
  }

  async deleteAssignment(assignmentId) {
    try {
      await deleteDoc(doc(db, 'tf_assignments', assignmentId));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'خطأ في حذف الواجب: ' + e.message };
    }
  }

  // Exams Management
  async addExam(exam) {
    try {
      exam.id = 'e_' + Date.now();
      exam.createdAt = new Date().toISOString();
      await setDoc(doc(db, 'tf_exams', exam.id), exam);
      return { success: true, id: exam.id };
    } catch (e) {
      return { success: false, message: 'خطأ في إضافة الامتحان: ' + e.message };
    }
  }

  async getExams() {
    const snapshot = await getDocs(collection(db, 'tf_exams'));
    return snapshot.docs.map(doc => doc.data());
  }

  async deleteExam(examId) {
    try {
      await deleteDoc(doc(db, 'tf_exams', examId));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'خطأ في حذف الامتحان: ' + e.message };
    }
  }

  // الاشتراكات والدفع والطلبات يمكن إضافتها بنفس النمط
}


// إنشاء نسخة عام من النظام
window.advancedStorage = new AdvancedStorageSystem();
