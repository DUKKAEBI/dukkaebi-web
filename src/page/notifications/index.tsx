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

export interface NoticePageResponse {
  content: Notice[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export default function NoticesPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const [searchQuery, setSearchQuery] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pageArray, setPageArray] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모든 공지 조회
  const fetchNotices = async (
    page: number = 0,
    size: number = 15
  ): Promise<NoticePageResponse> => {
    try {
      const res = await axiosInstance.get<NoticePageResponse>("/notice", {
        params: {
          page: page,
          size: size,
        },
      });
      const pageNumbers = Array.from({ length: res.data.totalPages }, (_, i) => i + 1);
      setPageArray(pageNumbers);
      return res.data;
    } catch (error) {
      console.error("Error fetching notices:", error);
      throw error;
    }
  };

  // 공지 검색 
  const searchNotices = async () => {
    try {
      const res = await axiosInstance.get<Notice[]>("/notice/search", {
        params: {
          keyword: searchQuery,
        },
      });
      const sortedNotices = [...res.data].sort(
        (a, b) => b.noticeId - a.noticeId
      );
      setNotices(sortedNotices);
    } catch (error) {
      console.error("Error searching notices:", error);
    }
  }

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNotices(currentPage - 1, 15);
        const sortedNotices = [...data.content].sort(
          (a, b) => b.noticeId - a.noticeId
        );
        setNotices(sortedNotices);
      } catch (err) {
        setError("공지사항을 불러올 수 없습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotices();
  }, [currentPage]);

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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchNotices();
                }
              }}
            />
            <img src={search} alt="search" onClick={searchNotices}/>
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

            {loading ? (
              <TableRow isLast={true}>
                <span style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af' }}>
                  로딩 중...
                </span>
              </TableRow>
            ) : error ? (
              <TableRow isLast={true}>
                <span style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ef4444' }}>
                  {error}
                </span>
              </TableRow>
            ) : notices.length === 0 ? (
              <TableRow isLast={true}>
                <span style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af' }}>
                  {searchQuery ? '검색 결과가 없습니다.' : '아직 공지사항이 없습니다.'}
                </span>
              </TableRow>
            ) : (
              notices.map((notice, index) => (
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
            ))
            )}
          </NoticeTable>

          {/* Pagination */}
          <PaginationWrapper>
            <Pagination>
              <ArrowButton direction="left" onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}>
                <img src={arrowLeft} alt="prev" />
              </ArrowButton>

              <Pages>
                {pageArray.map((page) => (
                  <PageButton
                    key={page}
                    active={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PageButton>
                ))}
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
