// todo : api연결, pagination 부분에 페이지 버튼 동적으로 변경
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import arrowLeft from "../../assets/image/notifications/arrow-left.png";
import arrowRight from "../../assets/image/notifications/arrow-right.png";
import search from "../../assets/image/notifications/search.png";

import {
  Page,
  Main,
  Container,
  SearchBar,
  NoticeTable,
  TableHeader,
  TableRow,
  Left,
  Right,
  PaginationWrapper,
  Pagination,
  ArrowButton,
  Pages,
  PageButton,
} from "./style";

export default function NoticesPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const notices = Array.from({ length: 15 }, (_, i) => ({
    id: 15 - i,
    title: "DGSW 프로그래밍 대회 관련 안내",
    author: "이**",
    date: "2026.01.01",
    views: 10,
  }));

  return (
    <Page>
      <Header />

      <Main>
        <Container>
          {/* Search */}
          <SearchBar>
            <input
              type="text"
              placeholder="공지사항을 검색하세요.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <img src={search} alt="search" />
          </SearchBar>

          {/* Table */}
          <NoticeTable>
            <TableHeader>
              <Left>
                <span>번호</span>
                <span>제목</span>
              </Left>
              <Right>
                <span>작성자</span>
                <span>등록일</span>
                <span>조회</span>
              </Right>
            </TableHeader>

            {notices.map((notice, index) => (
              <TableRow
                key={notice.id}
                isLast={index === notices.length - 1}
                onClick={() => navigate(`/notifications/${notice.id}`)}
              >
                <Left>
                  <span>{notice.id}</span>
                  <span>{notice.title}</span>
                </Left>
                <Right>
                  <span>{notice.author}</span>
                  <span>{notice.date}</span>
                  <span>{notice.views}</span>
                </Right>
              </TableRow>
            ))}
          </NoticeTable>

          {/* Pagination */}
          <PaginationWrapper>
            <Pagination>
              <ArrowButton direction="left">
                <img src={arrowLeft} alt="prev" />
              </ArrowButton>

              <Pages>
                {[1, 2, 3, 4, 5].map((page) => (
                  <PageButton
                    key={page}
                    active={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PageButton>
                ))}
              </Pages>

              <ArrowButton direction="right">
                <img src={arrowRight} alt="next" />
              </ArrowButton>
            </Pagination>
          </PaginationWrapper>
        </Container>
      </Main>

      <Footer />
    </Page>
  );
}
