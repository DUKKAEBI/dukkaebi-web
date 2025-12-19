import styled from "styled-components";

const COLORS = {
  primary: "#00b4b7",
  white: "#ffffff",
  grayLight: "#f6f6f6",
  grayBorder: "#ededed",
  black: "#1d1d1d",
  grayText: "#828282",
};

export const Container = styled.div`
  min-height: 100vh;
  background-color: ${COLORS.grayLight};
  display: flex;
  flex-direction: column;
  width: 100vw;
`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 150px 0;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  width: 100vw;
  max-width: 100vw;
  margin: 0;
`;


export const TopSection = styled.div`
  width: 100vw;
  background: ${COLORS.white};
  border-radius: 0;
  padding: 32px 40px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  margin: 0;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 230px;
  gap: 32px;
`;


export const ProfileRow = styled.div`
  width: 100%;
  max-width: 1280px;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 32px;
`;

export const VerticalDivider = styled.div`
  width: 1px;
  height: 100px;
  background: ${COLORS.grayBorder};
  margin-left: -70px;
`;

export const Avatar = styled.img`
  width: 80px;
  height: 80px;
  aspect-ratio: 1/1;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f0f0;
  margin-left: 10px;
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  gap: 8px;
 
`;

export const ProfileName = styled.div`
  color: #000;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
`;

export const ProfileTitle = styled.div`
  color: #986B52;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  margin-left: 8px;
`;

export const ProgressWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 16px;
  justify-content: center;
`;

export const ProgressLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: ${COLORS.grayText};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: #f1f1f1;
  border-radius: 999px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(p) => p.$percent}%;
  background: ${COLORS.primary};
  border-radius: 999px;
  transition: width 0.36s ease;
`;

export const RightProfileMeta = styled.div`
  color: #BDBDBD;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;
  align-self: flex-end;
  margin-bottom: 17px;
  margin-left: 5px;
  margin-right: 5px;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 50px;
  padding-left: 4px;
  margin-top: 10px;
  width: 100%;
  max-width: 1280px;
`;

export const TabItem = styled.div<{ $active?: boolean }>`
  padding: 8px 6px;
  font-weight: 600;
  color: ${(p) => (p.$active ? COLORS.primary : COLORS.grayText)};
  cursor: pointer;
`;

export const Tag = styled.span`
  display: inline-block;
  background: #f6f6f6;
  color: ${COLORS.grayText};
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  margin-right: 6px;
`;

export const CourseGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  margin-top: 20px;
  max-width: 1280px;
  padding: 0 10px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const CourseCard = styled.div`
  display: flex;
  width: 230.5px;
  height: 291px;
  padding: 30px 20px 20px 20px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  border: 1px solid #EDEDED;
  background: #FFF;
  cursor: default;
  position: relative;
`;

export const CourseImage = styled.img`
  display: none;
`;

export const CourseTitle = styled.div`
  color: #000;
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding: 0;
  margin: 0;
  width: 100%;
  text-align: left;
`;

export const CourseDesc = styled.div`
  display: none;
`;

export const CourseMeta = styled.div`
  display: none;
`;

export const CourseProgressBar = styled.div`
  width: 190px;
  height: 0;
  flex-shrink: 0;
  position: relative;
  border-top: 3px solid #E0E0E0;
  border-radius: 999px;
`;

export const CourseProgressFill = styled.div<{ $percent: number }>`
  position: absolute;
  top: -3px;
  left: 0;
  width: ${(p) => {
    const percent = Math.min(100, Math.max(0, p.$percent));
    return `${(190 * percent) / 100}px`;
  }};
  height: 0;
  border-top: 3px solid #00B4B7;
  border-radius: 999px;
  transition: width 0.3s ease;
`;

export const CourseBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

/* 새로운 카드 스타일 */
export const CourseDifficultyLabel = styled.p`
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: #00b4b7;
  margin: 0 0 -110px 0;
  width: 100%;
  text-align: left;
`;

export const CourseTagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
  margin-top: -95px;
`;

export const CourseTagChip = styled.div`
  background-color: ${COLORS.grayLight};
  border: 1px solid ${COLORS.grayBorder};
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #828282;
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  white-space: nowrap;
`;

export const CourseProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 2px;
`;

export const CourseProgressPercent = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: ${COLORS.primary};
  margin: 0;
  line-height: normal;
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



export const SectionTitle = styled.div`
  color: #000;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-align: left;
  width: 100%;
  max-width: 1280px;
  margin: 20px 0 10px 21px;
`;
