import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../components/header";
import { Footer } from "../../../components/footer";
import noticeApi from "../../../api/noticeApi";
import { SearchBar, NoticeTable, Pagination } from "../../../components/notifications";

import {
  Page,
  Main,
  Container,
  PaginationWrapper,
} from "./style";

interface Notice {
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
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pageArray, setPageArray] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotices = async (
    page: number = 0,
    size: number = 15
  ): Promise<NoticePageResponse> => {
    try {
      const data = await noticeApi.getNotices<NoticePageResponse>(page, size);
      const pageNumbers = Array.from({ length: data.totalPages }, (_, i) => i + 1);
      setPageArray(pageNumbers);
      setTotalPages(data.totalPages);
      return data;
    } catch (error) {
      console.error("Error fetching notices:", error);
      throw error;
    }
  };

  const searchNotices = async () => {
    try {
      const data = await noticeApi.searchNotices<Notice[]>(searchQuery);
      const sortedNotices = [...data].sort(
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
        const data = await fetchNotices(currentPage, 15);
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
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchNotices();
              }
            }}
            onSearchClick={searchNotices}
          />

          <NoticeTable 
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            notices={notices}
            onNoticeClick={(noticeId) => navigate(`/notifications/${noticeId}`)}
          />

          <PaginationWrapper>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              pageArray={pageArray}
              onPageChange={setCurrentPage}
            />
          </PaginationWrapper>
        </Container>
      </Main>

      <Footer />
    </Page>
  );
}
