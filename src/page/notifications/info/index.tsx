//todo : api 연결(서버 반환 방식에 따라 공지사항 이미지 표시 방법 반영)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../../components/header";
import { Footer } from "../../../components/footer";
import * as S from "./style";
// TODO: Uncomment when API is ready
// import axiosInstance from "../../../api/axiosInstance";

interface NoticeDetail {
  id: number;
  title: string;
  author: string;
  date: string;
  views: number;
  content: string;
}

export default function NoticeInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await axiosInstance.get(`/notice/${id}`);
        // setNotice(response.data);

        // Mock data for now
        setNotice({
          id: Number(id) || 1,
          title: "DGSW 프로그래밍 대회 관련 안내",
          author: "이**",
          date: "2026.01.01",
          views: 10,
          content: `안녕하세요. DGSW 프로그래밍 대회 관련 안내사항을 전달드립니다.

대회 일정 및 참가 방법에 대한 상세 내용을 아래와 같이 안내드리니 참고하시기 바랍니다.

1. 대회 일정
- 접수 기간: 2026년 1월 1일 ~ 1월 15일
- 대회 일시: 2026년 1월 20일 (토) 14:00 ~ 18:00
- 결과 발표: 2026년 1월 25일

2. 참가 방법
- 온라인 접수: 두께비 홈페이지를 통해 접수
- 참가비: 무료
- 참가 자격: DGSW 재학생 및 졸업생

3. 시상 내역
- 대상: 1명 (상금 100만원)
- 금상: 2명 (상금 50만원)
- 은상: 3명 (상금 30만원)
- 동상: 5명 (상금 10만원)

4. 문의사항
- 이메일: contest@dgsw.hs.kr
- 전화: 053-231-1234

많은 참여 부탁드립니다.`,
        });
      } catch (error) {
        console.error("Error fetching notice:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNotice();
    }
  }, [id]);

  const handleBack = () => {
    navigate("/notifications");
  };

  if (loading) {
    return (
      <S.Page>
        <Header />
        <S.Main>
          <S.Container>
            <S.LoadingText>로딩 중...</S.LoadingText>
          </S.Container>
        </S.Main>
        <Footer />
      </S.Page>
    );
  }

  if (!notice) {
    return (
      <S.Page>
        <Header />
        <S.Main>
          <S.Container>
            <S.ErrorText>공지사항을 찾을 수 없습니다.</S.ErrorText>
            <S.BackButton onClick={handleBack}>목록으로 돌아가기</S.BackButton>
          </S.Container>
        </S.Main>
        <Footer />
      </S.Page>
    );
  }

  return (
    <S.Page>
      <Header />

      <S.Main>
        <S.Container>
          {/* Notice Header */}
          <S.NoticeHeader>
            <S.Title>{notice.title}</S.Title>
            <S.MetaInfo>
              <S.MetaItem>
                <S.MetaLabel>작성자</S.MetaLabel>
                <S.MetaValue>{notice.author}</S.MetaValue>
              </S.MetaItem>
              <S.MetaItem>
                <S.MetaLabel>등록일</S.MetaLabel>
                <S.MetaValue>{notice.date}</S.MetaValue>
              </S.MetaItem>
              <S.MetaItem>
                <S.MetaLabel>조회</S.MetaLabel>
                <S.MetaValue>{notice.views}</S.MetaValue>
              </S.MetaItem>
            </S.MetaInfo>
          </S.NoticeHeader>

          {/* Notice Content */}
          <S.NoticeContent>
            <S.ContentText>{notice.content}</S.ContentText>
          </S.NoticeContent>

          {/* Navigation Buttons */}
          <S.ActionBar>
            <S.ListButton onClick={handleBack}>목록으로</S.ListButton>
          </S.ActionBar>
        </S.Container>
      </S.Main>

      <Footer />
    </S.Page>
  );
}
