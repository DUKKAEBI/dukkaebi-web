import { Routes, Route } from "react-router-dom";
import Login from "../page/login";
import Signup from "../page/sigup";
import Main from "../page/main";
import ContestDetail from "../page/contestDetail/contestDetail";
import { ContestPage } from "../page/contests/index";
import Profile from "../page/profile";
import SolvePage from "../page/solve";
import Problems from "../page/problems";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Main />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/solve" element={<SolvePage />} />
      <Route path="/problems" element={<Problems />} />
      <Route path="/contests" element={<ContestPage />} />
      <Route path="/contests/:contestId" element={<ContestDetail />} />
    </Routes>
  );
}
