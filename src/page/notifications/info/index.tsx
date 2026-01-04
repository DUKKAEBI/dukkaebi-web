//todo : api 연결(서버 반환 방식에 따라 공지사항 이미지 표시 방법 반영)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../../components/header";
import { Footer } from "../../../components/footer";
import * as S from "./style";
import axiosInstance from "../../../api/axiosInstance";
// TODO: Uncomment when API is ready
// import axiosInstance from "../../../api/axiosInstance";

interface NoticeDetail {
  title: string;
  writer: string;
  createdAt: string;
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
        const response = await axiosInstance.get(`/notice/${id}`);
        setNotice(response.data);
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
                <S.MetaValue>{notice.writer}</S.MetaValue>
              </S.MetaItem>
              <S.MetaItem>
                <S.MetaLabel>등록일</S.MetaLabel>
                <S.MetaValue>{notice.createdAt}</S.MetaValue>
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
