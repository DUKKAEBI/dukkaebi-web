import styled from "styled-components";

// Styled Components
export const Container = styled.div`
  margin: 0;
  padding: 0;
  width: 100vw;
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

export const UserIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
`;

export const HeroBanner = styled.div`
  width: 100%;
  height: 240px;
  background: #315374;
  position: relative;
  overflow: hidden;
`;

export const HeroContent = styled.div`
  position: absolute;
  left: 80px;
  top: 40px;
  z-index: 10;

  @media (max-width: 768px) {
    left: 40px;
  }
`;

export const HeroTitle = styled.h1`
  font-family: "Paperlogy", "SB AggroOTF", "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 36px;
  line-height: 1.2;
  color: white;
  margin: 0 0 4px 0;
`;

export const HeroTitleHighlight = styled.span`
  color: #2cb0ff;
`;

export const HeroSubtitle = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
`;

export const CarouselControls = styled.div`
  position: absolute;
  left: 80px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;

  @media (max-width: 768px) {
    left: 40px;
  }
`;

export const CarouselButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;

  svg {
    width: 24px;
    height: 24px;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }

  &:hover svg path {
    stroke: rgba(255, 255, 255, 0.8);
  }
`;

export const CarouselIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
`;

export const CarouselText = styled.span<{ $active: boolean }>`
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.4)")};
`;

export const CarouselDivider = styled.span`
  color: rgba(255, 255, 255, 0.4);
`;

export const MainContent = styled.main`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
`;

export const SearchBar = styled.div`
  width: 100%;
  max-width: 388px;
  background: #f6f6f6;
  border: 1px solid #ededed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  margin-bottom: 40px;
`;

export const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1d1d1d;

  &::placeholder {
    color: #bdbdbd;
  }
`;

export const SearchIcon = styled.div`
  font-size: 20px;
`;

export const ContestsSection = styled.section`
  width: 100%;
  max-width: 794px;
  display: flex;
  flex-direction: column;
  gap: 60px;
  padding: 20px;
`;

export const ContestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 183px);

  gap: 20px;
  width: 100%;
  justify-content: center;

  @media (max-width: 850px) {
    grid-template-columns: repeat(auto-fill, 150px);
  }
`;

export const ContestCard = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const CardImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 69.95%; /* 128/183 비율 유지 */
  border-radius: 8px 8px 0 0;
  overflow: hidden;
`;

export const CardImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const CardBadge = styled.button<{
  $status: string;
  $bgColor: string;
  $textColor: string;
}>`
  position: absolute;
  bottom: 8px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: ${(props) => props.$textColor};
  background: ${(props) => props.$bgColor};
  white-space: nowrap;
  outline: none;

  &:focus {
    outline: none;
  }

  &:active {
    outline: none;
  }

  &:hover {
    outline: none;
  }
`;

export const CardContent = styled.div`
  background: #f6f6f6;
  border: 1px solid #ededed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 12px 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const CardTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: black;
  margin: 0;
  line-height: 1.4;
`;

export const CardInfo = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #bdbdbd;
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

export const PaginationButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover svg path {
    stroke: #828282;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }
`;

export const PaginationNumbers = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const PageNumber = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => (props.$active ? "#828282" : "#BDBDBD")};
  cursor: pointer;
  padding: 0;
  outline: none;

  &:hover {
    color: #828282;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }
`;

export const NoContestsMessage = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #bdbdbd;
  text-align: center;
  padding: 40px;
`;

export const NoResultsMessage = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #bdbdbd;
  text-align: center;
  padding: 40px;
  grid-column: 1 / -1;
`;
