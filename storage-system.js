/**
 * Advanced Storage System
 * ✅ Courses Management
 * ✅ Lessons & Videos
 * ✅ Quizzes & Exams
 * ✅ Student Requests & Approval
 * ✅ Grades Tracking
 */

class StorageSystem {
  constructor() {
    this.initStorage();
  }

  /**
   * Initialize all storage collections
   */
  initStorage() {
    const collections = [
      'tf_courses',
      'tf_lessons',
      'tf_quizzes',
      'tf_quiz_answers',
      'tf_student_requests',
      'tf_student_enrollments',
      'tf_grades',
      'tf_assignments',
      'tf_assignment_submissions'
    ];

    collections.forEach(collection => {
      if (!localStorage.getItem(collection)) {
        localStorage.setItem(collection, JSON.stringify([]));
      }
    });
  }

  // ============ COURSES ============

  /**
   * Add a new course
   */
  addCourse(courseData) {
    try {
      const courses = JSON.parse(localStorage.getItem('tf_courses') || '[]');
      const newCourse = {
        id: 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...courseData,
        createdAt: new Date().toISOString(),
        createdBy: this.getCurrentAdminId(),
        studentCount: 0,
        lessonsCount: 0,
        quizzesCount: 0,
        status: 'active'
      };

      courses.push(newCourse);
      localStorage.setItem('tf_courses', JSON.stringify(courses));
      return { success: true, courseId: newCourse.id, message: 'تم إضافة الكورس بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get all courses
   */
  getAllCourses() {
    try {
      return JSON.parse(localStorage.getItem('tf_courses') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Get course by ID
   */
  getCourse(courseId) {
    const courses = this.getAllCourses();
    return courses.find(c => c.id === courseId);
  }

  /**
   * Update course
   */
  updateCourse(courseId, updates) {
    try {
      const courses = JSON.parse(localStorage.getItem('tf_courses') || '[]');
      const idx = courses.findIndex(c => c.id === courseId);

      if (idx === -1) {
        return { success: false, message: 'الكورس غير موجود' };
      }

      courses[idx] = {
        ...courses[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: this.getCurrentAdminId()
      };

      localStorage.setItem('tf_courses', JSON.stringify(courses));
      return { success: true, message: 'تم تحديث الكورس بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete course
   */
  deleteCourse(courseId) {
    try {
      const courses = JSON.parse(localStorage.getItem('tf_courses') || '[]');
      const filtered = courses.filter(c => c.id !== courseId);

      localStorage.setItem('tf_courses', JSON.stringify(filtered));

      // Also delete related lessons, quizzes, etc.
      this.deleteCourseLessons(courseId);
      this.deleteCourseQuizzes(courseId);

      return { success: true, message: 'تم حذف الكورس بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // ============ LESSONS ============

  /**
   * Add a lesson to a course
   */
  addLesson(courseId, lessonData) {
    try {
      const lessons = JSON.parse(localStorage.getItem('tf_lessons') || '[]');

      const newLesson = {
        id: 'lesson_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        courseId,
        ...lessonData,
        createdAt: new Date().toISOString(),
        createdBy: this.getCurrentAdminId(),
        videoUrl: lessonData.videoUrl || null,
        contentUrl: lessonData.contentUrl || null,
        hasVideo: !!lessonData.videoUrl,
        hasContent: !!lessonData.contentUrl
      };

      lessons.push(newLesson);
      localStorage.setItem('tf_lessons', JSON.stringify(lessons));

      // Update course lesson count
      this.updateCourseLessonCount(courseId);

      return { success: true, lessonId: newLesson.id, message: 'تم إضافة الدرس بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get lessons for a course
   */
  getCourseLessons(courseId) {
    try {
      const lessons = JSON.parse(localStorage.getItem('tf_lessons') || '[]');
      return lessons.filter(l => l.courseId === courseId);
    } catch {
      return [];
    }
  }

  /**
   * Get a single lesson
   */
  getLesson(lessonId) {
    const lessons = JSON.parse(localStorage.getItem('tf_lessons') || '[]');
    return lessons.find(l => l.id === lessonId);
  }

  /**
   * Update lesson
   */
  updateLesson(lessonId, updates) {
    try {
      const lessons = JSON.parse(localStorage.getItem('tf_lessons') || '[]');
      const idx = lessons.findIndex(l => l.id === lessonId);

      if (idx === -1) {
        return { success: false, message: 'الدرس غير موجود' };
      }

      lessons[idx] = {
        ...lessons[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('tf_lessons', JSON.stringify(lessons));
      return { success: true, message: 'تم تحديث الدرس بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete lesson
   */
  deleteLesson(lessonId) {
    try {
      const lessons = JSON.parse(localStorage.getItem('tf_lessons') || '[]');
      const lesson = lessons.find(l => l.id === lessonId);

      if (!lesson) {
        return { success: false, message: 'الدرس غير موجود' };
      }

      const filtered = lessons.filter(l => l.id !== lessonId);
      localStorage.setItem('tf_lessons', JSON.stringify(filtered));

      // Update course lesson count
      this.updateCourseLessonCount(lesson.courseId);

      return { success: true, message: 'تم حذف الدرس بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete all lessons for a course
   */
  deleteCourseLessons(courseId) {
    try {
      const lessons = JSON.parse(localStorage.getItem('tf_lessons') || '[]');
      const filtered = lessons.filter(l => l.courseId !== courseId);
      localStorage.setItem('tf_lessons', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting course lessons:', error);
    }
  }

  // ============ QUIZZES ============

  /**
   * Add quiz to a lesson
   */
  addQuiz(lessonId, quizData) {
    try {
      const quizzes = JSON.parse(localStorage.getItem('tf_quizzes') || '[]');

      const newQuiz = {
        id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        lessonId,
        ...quizData,
        createdAt: new Date().toISOString(),
        createdBy: this.getCurrentAdminId(),
        totalQuestions: (quizData.questions || []).length,
        durationMinutes: quizData.durationMinutes || 30,
        passingScore: quizData.passingScore || 50
      };

      quizzes.push(newQuiz);
      localStorage.setItem('tf_quizzes', JSON.stringify(quizzes));

      return { success: true, quizId: newQuiz.id, message: 'تم إضافة الاختبار بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get quizzes for a lesson
   */
  getLessonQuizzes(lessonId) {
    try {
      const quizzes = JSON.parse(localStorage.getItem('tf_quizzes') || '[]');
      return quizzes.filter(q => q.lessonId === lessonId);
    } catch {
      return [];
    }
  }

  /**
   * Get quiz by ID
   */
  getQuiz(quizId) {
    const quizzes = JSON.parse(localStorage.getItem('tf_quizzes') || '[]');
    return quizzes.find(q => q.id === quizId);
  }

  /**
   * Delete quiz
   */
  deleteQuiz(quizId) {
    try {
      const quizzes = JSON.parse(localStorage.getItem('tf_quizzes') || '[]');
      const filtered = quizzes.filter(q => q.id !== quizId);
      localStorage.setItem('tf_quizzes', JSON.stringify(filtered));

      // Also delete quiz answers
      this.deleteQuizAnswers(quizId);

      return { success: true, message: 'تم حذف الاختبار بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete all quizzes for a course
   */
  deleteCourseQuizzes(courseId) {
    try {
      const lessons = this.getCourseLessons(courseId);
      lessons.forEach(lesson => {
        const quizzes = this.getLessonQuizzes(lesson.id);
        quizzes.forEach(quiz => {
          this.deleteQuiz(quiz.id);
        });
      });
    } catch (error) {
      console.error('Error deleting course quizzes:', error);
    }
  }

  // ============ QUIZ ANSWERS ============

  /**
   * Submit quiz answers
   */
  submitQuizAnswers(studentId, quizId, answers) {
    try {
      const quiz = this.getQuiz(quizId);
      if (!quiz) {
        return { success: false, message: 'الاختبار غير موجود' };
      }

      // Calculate score
      let correctAnswers = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / quiz.questions.length) * 100;
      const passed = score >= quiz.passingScore;

      const submission = {
        id: 'submission_' + Date.now(),
        studentId,
        quizId,
        answers,
        score: Math.round(score),
        correctAnswers,
        totalQuestions: quiz.questions.length,
        passed,
        submittedAt: new Date().toISOString()
      };

      const quizAnswers = JSON.parse(localStorage.getItem('tf_quiz_answers') || '[]');
      quizAnswers.push(submission);
      localStorage.setItem('tf_quiz_answers', JSON.stringify(quizAnswers));

      // Update grades
      this.recordGrade(studentId, quizId, score, 'quiz');

      return {
        success: true,
        score: Math.round(score),
        passed,
        message: passed ? 'مبروك! نجحت في الاختبار' : 'للأسف لم تحقق الدرجة المطلوبة'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get student quiz results
   */
  getStudentQuizResults(studentId) {
    try {
      const answers = JSON.parse(localStorage.getItem('tf_quiz_answers') || '[]');
      return answers.filter(a => a.studentId === studentId);
    } catch {
      return [];
    }
  }

  /**
   * Delete quiz answers
   */
  deleteQuizAnswers(quizId) {
    try {
      const answers = JSON.parse(localStorage.getItem('tf_quiz_answers') || '[]');
      const filtered = answers.filter(a => a.quizId !== quizId);
      localStorage.setItem('tf_quiz_answers', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting quiz answers:', error);
    }
  }

  // ============ STUDENT REQUESTS ============

  /**
   * Create student enrollment request
   */
  createEnrollmentRequest(studentId, courseId) {
    try {
      const requests = JSON.parse(localStorage.getItem('tf_student_requests') || '[]');

      const newRequest = {
        id: 'req_' + Date.now(),
        studentId,
        courseId,
        status: 'pending', // pending, approved, rejected
        requestedAt: new Date().toISOString(),
        approvedAt: null,
        approvedBy: null,
        rejectionReason: null
      };

      requests.push(newRequest);
      localStorage.setItem('tf_student_requests', JSON.stringify(requests));

      return { success: true, message: 'تم إرسال طلب الالتحاق بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get pending requests
   */
  getPendingRequests() {
    try {
      const requests = JSON.parse(localStorage.getItem('tf_student_requests') || '[]');
      return requests.filter(r => r.status === 'pending');
    } catch {
      return [];
    }
  }

  /**
   * Get student requests
   */
  getStudentRequests(studentId) {
    try {
      const requests = JSON.parse(localStorage.getItem('tf_student_requests') || '[]');
      return requests.filter(r => r.studentId === studentId);
    } catch {
      return [];
    }
  }

  /**
   * Approve enrollment request
   */
  approveRequest(requestId) {
    try {
      const requests = JSON.parse(localStorage.getItem('tf_student_requests') || '[]');
      const request = requests.find(r => r.id === requestId);

      if (!request) {
        return { success: false, message: 'الطلب غير موجود' };
      }

      request.status = 'approved';
      request.approvedAt = new Date().toISOString();
      request.approvedBy = this.getCurrentAdminId();

      localStorage.setItem('tf_student_requests', JSON.stringify(requests));

      // Add enrollment
      this.addEnrollment(request.studentId, request.courseId);

      return { success: true, message: 'تم الموافقة على الطلب بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Reject enrollment request
   */
  rejectRequest(requestId, reason) {
    try {
      const requests = JSON.parse(localStorage.getItem('tf_student_requests') || '[]');
      const request = requests.find(r => r.id === requestId);

      if (!request) {
        return { success: false, message: 'الطلب غير موجود' };
      }

      request.status = 'rejected';
      request.approvedAt = new Date().toISOString();
      request.approvedBy = this.getCurrentAdminId();
      request.rejectionReason = reason;

      localStorage.setItem('tf_student_requests', JSON.stringify(requests));

      return { success: true, message: 'تم رفض الطلب' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // ============ ENROLLMENTS ============

  /**
   * Add student enrollment
   */
  addEnrollment(studentId, courseId) {
    try {
      const enrollments = JSON.parse(localStorage.getItem('tf_student_enrollments') || '[]');

      // Check if already enrolled
      if (enrollments.some(e => e.studentId === studentId && e.courseId === courseId)) {
        return { success: false, message: 'الطالب مسجل بالفعل في هذا الكورس' };
      }

      const enrollment = {
        id: 'enroll_' + Date.now(),
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        status: 'active'
      };

      enrollments.push(enrollment);
      localStorage.setItem('tf_student_enrollments', JSON.stringify(enrollments));

      // Update course student count
      this.updateCourseStudentCount(courseId);

      return { success: true, message: 'تم التسجيل في الكورس بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get student enrollments
   */
  getStudentEnrollments(studentId) {
    try {
      const enrollments = JSON.parse(localStorage.getItem('tf_student_enrollments') || '[]');
      return enrollments.filter(e => e.studentId === studentId);
    } catch {
      return [];
    }
  }

  /**
   * Get course enrollments
   */
  getCourseEnrollments(courseId) {
    try {
      const enrollments = JSON.parse(localStorage.getItem('tf_student_enrollments') || '[]');
      return enrollments.filter(e => e.courseId === courseId);
    } catch {
      return [];
    }
  }

  /**
   * Update enrollment progress
   */
  updateEnrollmentProgress(studentId, courseId, progress) {
    try {
      const enrollments = JSON.parse(localStorage.getItem('tf_student_enrollments') || '[]');
      const enrollment = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);

      if (!enrollment) {
        return { success: false, message: 'التسجيل غير موجود' };
      }

      enrollment.progress = Math.min(100, progress);
      enrollment.lastUpdated = new Date().toISOString();

      localStorage.setItem('tf_student_enrollments', JSON.stringify(enrollments));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // ============ GRADES ============

  /**
   * Record grade
   */
  recordGrade(studentId, itemId, score, type) {
    try {
      const grades = JSON.parse(localStorage.getItem('tf_grades') || '[]');

      const grade = {
        id: 'grade_' + Date.now(),
        studentId,
        itemId,
        score,
        type, // quiz, assignment, exam, homework
        recordedAt: new Date().toISOString(),
        recordedBy: this.getCurrentAdminId()
      };

      grades.push(grade);
      localStorage.setItem('tf_grades', JSON.stringify(grades));

      return { success: true, message: 'تم تسجيل الدرجة بنجاح' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Get student grades
   */
  getStudentGrades(studentId) {
    try {
      const grades = JSON.parse(localStorage.getItem('tf_grades') || '[]');
      return grades.filter(g => g.studentId === studentId);
    } catch {
      return [];
    }
  }

  /**
   * Get student average score
   */
  getStudentAverageScore(studentId) {
    const grades = this.getStudentGrades(studentId);
    if (grades.length === 0) return 0;

    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round(sum / grades.length);
  }

  // ============ HELPER FUNCTIONS ============

  /**
   * Get current admin ID
   */
  getCurrentAdminId() {
    const current = JSON.parse(localStorage.getItem('tf_current') || 'null');
    return current ? current.id : 'admin_system';
  }

  /**
   * Update course student count
   */
  updateCourseStudentCount(courseId) {
    try {
      const enrollments = this.getCourseEnrollments(courseId);
      const courses = JSON.parse(localStorage.getItem('tf_courses') || '[]');
      const course = courses.find(c => c.id === courseId);

      if (course) {
        course.studentCount = enrollments.length;
        localStorage.setItem('tf_courses', JSON.stringify(courses));
      }
    } catch (error) {
      console.error('Error updating course student count:', error);
    }
  }

  /**
   * Update course lesson count
   */
  updateCourseLessonCount(courseId) {
    try {
      const lessons = this.getCourseLessons(courseId);
      const courses = JSON.parse(localStorage.getItem('tf_courses') || '[]');
      const course = courses.find(c => c.id === courseId);

      if (course) {
        course.lessonsCount = lessons.length;
        localStorage.setItem('tf_courses', JSON.stringify(courses));
      }
    } catch (error) {
      console.error('Error updating course lesson count:', error);
    }
  }

  /**
   * Get complete student profile (for admin view)
   */
  getCompleteStudentProfile(studentId) {
    try {
      const students = JSON.parse(localStorage.getItem('tf_students') || '[]');
      const student = students.find(s => s.id === studentId);

      if (!student) {
        return null;
      }

      return {
        ...student,
        enrollments: this.getStudentEnrollments(studentId),
        requests: this.getStudentRequests(studentId),
        grades: this.getStudentGrades(studentId),
        averageScore: this.getStudentAverageScore(studentId),
        quizResults: this.getStudentQuizResults(studentId),
        totalCourses: this.getStudentEnrollments(studentId).length,
        totalGrades: this.getStudentGrades(studentId).length
      };
    } catch (error) {
      console.error('Error getting complete student profile:', error);
      return null;
    }
  }

  /**
   * Get all courses with detailed statistics
   */
  getCoursesWithStats() {
    try {
      const courses = this.getAllCourses();
      return courses.map(course => ({
        ...course,
        enrollments: this.getCourseEnrollments(course.id).length,
        lessons: this.getCourseLessons(course.id).length,
        quizzes: this.getCourseLessons(course.id).reduce((sum, lesson) => {
          return sum + this.getLessonQuizzes(lesson.id).length;
        }, 0)
      }));
    } catch {
      return [];
    }
  }

  /**
   * Export student data (for admin report)
   */
  exportStudentData(studentId) {
    try {
      const profile = this.getCompleteStudentProfile(studentId);
      return JSON.stringify(profile, null, 2);
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear all storage (use with caution!)
   */
  clearAllStorage() {
    if (!confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ هذا الإجراء غير قابل للعكس!')) {
      return false;
    }

    const collections = [
      'tf_courses',
      'tf_lessons',
      'tf_quizzes',
      'tf_quiz_answers',
      'tf_student_requests',
      'tf_student_enrollments',
      'tf_grades',
      'tf_assignments',
      'tf_assignment_submissions'
    ];

    collections.forEach(collection => {
      localStorage.removeItem(collection);
    });

    return true;
  }
}

// Create global instance
const storageSystem = new StorageSystem();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  storageSystem.initStorage();
});
