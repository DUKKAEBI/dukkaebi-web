import { Routes, Route } from "react-router-dom";
import Login from "../page/login";
import Signup from "../page/signup";
import Main from "../page/main";
import { ContestDetailPage } from "../page/contestDetail";
import { ContestPage } from "../page/contests/index";
import Profile from "../page/profile";
import SolvePage from "../page/solve";
import Problems from "../page/problems";
import CoursesPage from "../page/courses";
import CoursesExplorePage from "../page/courses/explore";
import CourseDetailPage from "../page/courseDetail";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Main />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/solve" element={<SolvePage />} />
      <Route path="/solve/:problemId" element={<SolvePage />} />
      <Route path="/problems" element={<Problems />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/explore" element={<CoursesExplorePage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      <Route path="/contests" element={<ContestPage />} />
      <Route path="/contests/:contestId" element={<ContestDetailPage />} />
    </Routes>
  );
}
