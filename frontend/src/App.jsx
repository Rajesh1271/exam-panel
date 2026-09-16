import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import Teacher from './pages/Teacher';
import Student from './pages/Student';
import AdminDashboard from './pages/AdminDashboard';
import AdminActivities from './pages/AdminActivities';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Course from './pages/Course';
import Question from './pages/Question';
import QuestionList from './pages/QuestionList';
import QuestionView from './pages/QuestionView';
import TeacherPageDashboard from './pages/TeacherPageDashboard';
import TeacherStudent from './pages/TeacherStudent';
import TeacherViewStudent from './pages/TeacherViewStudent';
import TeacherExams from './pages/TeacherExams';
import TakeExam from './pages/TakeExam';
import CreateExam from './pages/CreateExam';
import TeacherAddQuestion from './pages/TeacherAddQuestion';
import StudentPageDashboard from './pages/StudentPageDashboard';
import StudentExamPage from './pages/StudentExamPage';
import StudentResult from './pages/StudentResult';
import StudentMarks from './pages/StudentMarks';
import Aboutus from './pages/Aboutus';
import Contactus from './pages/Contactus';

function AppContent() {
  const location = useLocation();
  const publicPaths = ['/', '/about', '/contact', '/signup', '/admin-login', '/teacher-login', '/student-login', '/login'];
  const showPublicNavbar = publicPaths.includes(location.pathname.toLowerCase());

  return (
    <>
      {showPublicNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/teacher-login" element={<Teacher />} />
        <Route path="/student-login" element={<Student />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<Contactus />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-activities" element={<AdminActivities />} />
        <Route path="/admin-students" element={<StudentDashboard />} />
        <Route path="/questions" element={<Question />} />
        <Route path="/questions-list" element={<QuestionList />} />
        <Route path="/questions/:id" element={<QuestionView />} />
        <Route path="/courses" element={<Course />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        {/* Teacher Routes */}
        <Route path="/teacher-dashboardpage" element={<TeacherPageDashboard />} />
        <Route path="/teacher-students" element={<TeacherStudent />} />
        <Route path="/teacher/student/:id" element={<TeacherViewStudent />} />
        <Route path="/teacher-exams" element={<TeacherExams />} />
        <Route path="/teacher-create-exam" element={<CreateExam />} />
        <Route path="/teacher-questions" element={<TeacherAddQuestion />} />

        {/* Student Routes */}
        <Route path="/student-dashboard" element={<StudentPageDashboard />} />
        <Route path="/student-dashboardpage" element={<StudentPageDashboard />} />
        <Route path="/student-dashboardPage" element={<StudentPageDashboard />} />
        <Route path="/Student-dashboardpage" element={<StudentPageDashboard />} />
        <Route path="/student/dashboard" element={<StudentPageDashboard />} />
        <Route path="/student-exam/:examId" element={<StudentExamPage />} />
        <Route path="/student-result" element={<StudentResult />} />
        <Route path="/student-marks" element={<StudentMarks />} />
        <Route path="/student-exams" element={<TakeExam />} />
        <Route path="/take-exam" element={<TakeExam />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
