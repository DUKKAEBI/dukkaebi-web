import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/router.js";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
