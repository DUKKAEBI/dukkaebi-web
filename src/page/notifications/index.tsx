// todo : api연결, pagination 부분에 페이지 버튼 동적으로 변경
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import arrowLeft from "../../assets/image/notifications/arrow-left.png";
import arrowRight from "../../assets/image/notifications/arrow-right.png";
import search from "../../assets/image/notifications/search.png";
import axiosInstance from "../../api/axiosInstance";

import {
  Page,
  Main,
  Container,
  SearchBar,
  NoticeTable,
  TableHeader,
  TableRow,
  PaginationWrapper,
  Pagination,
  ArrowButton,
  Pages,
  PageButton,
} from "./style";

interface NoticeItem {
  noticeId: number;
  title: string;
  writer: string;
  date: string;
  hits: number;
}

interface NoticeResponse {
  content: NoticeItem[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first: boolean;
  last: boolean;
}

export default function NoticesPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const [searchQuery, setSearchQuery] = useState("");
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10; // 고정 사이즈

  useEffect(() => {
    fetchNotices();
  }, [currentPage]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<NoticeResponse>('/notice', {
        params: {
          page: currentPage,
          size: pageSize,
        },
      });
      setNotices(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // 1-based to 0-based
  };

  const renderPageButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PageButton
          key={i}
          active={currentPage + 1 === i}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PageButton>
      );
    }
    return pages;
  };

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
              <span>번호</span>
              <span>제목</span>
              <span>작성자</span>
              <span>등록일</span>
              <span>조회</span>
            </TableHeader>

            {notices.map((notice, index) => (
              <TableRow
                key={notice.noticeId}
                isLast={index === notices.length - 1}
                onClick={() => navigate(`/notifications/${notice.noticeId}`)}
              >
                <span>{notice.noticeId}</span>
                <span>{notice.title}</span>
                <span>{notice.writer}</span>
                <span>{notice.date}</span>
                <span>{notice.hits}</span>
              </TableRow>
            ))}
          </NoticeTable>

          {/* Pagination */}
          <PaginationWrapper>
            <Pagination>
              <ArrowButton direction="left" onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}>
                <img src={arrowLeft} alt="prev" />
              </ArrowButton>

              <Pages>
                {renderPageButtons()}
              </Pages>

              <ArrowButton direction="right" onClick={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}>
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
