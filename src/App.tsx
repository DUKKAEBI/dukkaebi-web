import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/router.tsx";
import { GlobalStyle } from "./page/styles/GlobalStyle.ts";

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;
  