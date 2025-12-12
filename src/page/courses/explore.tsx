import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import * as S from "./styles";

export default function CoursesExplorePage() {
  return (
    <S.Container>
      <Header />
      <S.Main style={{ padding: "32px 0", justifyContent: "flex-start" }}>
        <S.TopSection style={{ height: "auto", gap: "16px" }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>코스 탐방</div>
          <div style={{ color: "#828282", fontSize: 14 }}>
            다양한 신규 코스를 탐색할 수 있는 전용 페이지입니다.
          </div>
        </S.TopSection>
      </S.Main>
      <Footer />
    </S.Container>
  );
}

