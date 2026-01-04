import styled from "styled-components";

/* Layout */
export const Page = styled.div`
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

export const Main = styled.main`
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px;
`;

export const Container = styled.div`
  width: 794px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

/* Search */
export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;

  input {
    flex: 1;
    border: none;
    outline: none;

    font-size: 14px;
    color: #111827;

    &::placeholder {
      color: #9ca3af;
    }
  }

  img {
    cursor: pointer;
  }
`;

/* Table */
export const NoticeTable = styled.div`
  width: 100%;
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 120px 140px 80px;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
`;

export const TableRow = styled.div<{ isLast?: boolean }>`
  display: grid;
  grid-template-columns: 80px 1fr 120px 140px 80px;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  border-top: none;
  cursor: pointer;

  ${({ isLast }) =>
    isLast &&
    `
    border-radius: 0 0 8px 8px;
  `}
`;

export const Left = styled.div`
  display: flex;
  gap: 40px;
`;

export const Right = styled.div`
  display: flex;
  gap: 80px;
`;

/* Pagination */
export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const Pagination = styled.div`
  position: relative;
  width: 200px;
  height: 24px;
`;

export const ArrowButton = styled.button<{ direction: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ direction }) => (direction === "left" ? "left: 0;" : "right: 0;")}
  background: none;
  border: none;
  cursor: pointer;
`;

export const Pages = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
`;

export const PageButton = styled.button<{ active?: boolean }>`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: ${({ active }) => (active ? "#4b5563" : "#9ca3af")};
  font-weight: ${({ active }) => (active ? 500 : 400)};
`;
