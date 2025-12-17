import styled from "styled-components";

export const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
`;

export const Main = styled.main`
  min-height: 90vh;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

export const TopBar = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const SearchBar = styled.div`
  width: 100%;
  max-width: 794px;
  height: 46px;
  border: 1px solid var(--gray-4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--gray-5);
`;

export const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: var(--black);

  &::placeholder {
    color: var(--gray-3);
  }
`;

export const SearchIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Grid = styled.div`
  width: 100%;
  max-width: 1000px;
  display: grid;
  grid-template-columns: repeat(4, 183px);
  gap: 20px 20px;
  justify-content: center;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, 183px);
  }
`;

export const Card = styled.div`
  width: 183px;
  display: flex;
  flex-direction: column;
  background: var(--gray-5);
  border: 1px solid var(--gray-4);
  border-radius: 8px;
  padding: 16px;
  position: relative;
  min-height: 210px;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
`;

export const KeywordContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Keyword = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #666;
  padding: 6px 10px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
`;

export const LevelBadge = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: var(--primary);
`;

export const CardTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  margin: 0;
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 40px;
`;

export const PaginationButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 400;
  color: ${(p) => (p.$active ? "#828282" : "#BDBDBD")};
  cursor: pointer;
  padding: 4px 8px;
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const MoreButtonWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;

export const MoreButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  padding: 0;

  svg {
    opacity: 0.7;
  }

  &:hover svg {
    opacity: 1;
  }
`;

export const CourseMenu = styled.div`
  width: 90px;
  position: absolute;
  top: 32px;
  right: 12px;
  background: #ffffff;
  border: 1px solid var(--gray-4);
  border-radius: 8px;
  padding: 8px 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const CourseMenuItem = styled.button<{ $danger?: boolean }>`
  background: transparent;
  border: none;
  text-align: left;
  padding: 10px 16px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: ${(p) => (p.$danger ? "#EB5757" : "#000000")};
  cursor: pointer;
  width: 100%;

  &:hover {
    background: var(--gray-5);
  }
`;

export const SolveButton = styled.button`
  display: flex;
  padding: 8px 24px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  background: #00B4B7;
  border: none;
  color: #ffffff;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  margin-top: auto;

  &:hover {
    background: #00999c;
  }

  &:active {
    background: #008083;
  }
`;

export const BackButton = styled.button`
  position: fixed;
  left: 20px;
  bottom: 20px;
  display: flex;
  width: 56px;
  height: 56px;
  padding: 0;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgba(224, 224, 224, 0.8);
  border: none;
  cursor: pointer;
  z-index: 100;
  font-size: 24px;
  color: #ffffff;
  transition: background 0.2s;

  &:hover {
    background: rgba(208, 208, 208, 0.9);
  }

  &:active {
    background: rgba(192, 192, 192, 0.9);
  }
`;
