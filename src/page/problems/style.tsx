import styled from "styled-components";

// Colors
const COLORS = {
  primary: "#00b4b7",
  primaryLight: "rgba(0, 180, 183, 0.2)",
  black: "#1d1d1d",
  white: "#ffffff",
  grayLight: "#f6f6f6",
  grayBorder: "#ededed",
  grayText: "#828282",
  grayText2: "#bdbdbd",
  grayText3: "#e0e0e0",
};

// Main Container
export const ProblemsContainer = styled.div`
  min-height: 100vh;
  background-color: ${COLORS.grayLight};
  display: flex;
  flex-direction: column;
  width: 100vw;
`;

// Header
export const Header = styled.header`
  width: 100%;
  height: 80px;
  background: white;
  border-bottom: 1px solid #ededed;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
`;

export const LogoImage = styled.img`
  width: 80px;
  object-fit: contain;
`;

export const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

export const Logo = styled.img`
  width: 80px;
  height: 32px;
`;

export const NavMenu = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

// interface NavItemProps {
//   isActive?: boolean;
// }

export const NavItem = styled.div<{ $active?: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => (props.$active ? "#00B4B7" : "#1D1D1D")};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #00b4b7;
  }
`;

export const UserIcon = styled.div`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

// Main Content
export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px 60px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
`;

// Search Box
export const SearchBox = styled.div`
  width: 840px;
  height: 46px;
  background-color: ${COLORS.white};
  border: 1px solid ${COLORS.white};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 30px;
`;

export const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.black};
  background: transparent !important;

  &::placeholder {
    color: ${COLORS.black};
  }
`;

export const SearchIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

// Filter Section
export const FilterSection = styled.div`
  width: 840px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: visible;
  z-index: 10;
  margin-bottom: 20px;
`;

export const FilterButtonsWrapper = styled.div`
  display: flex;
  gap: 4px;
`;

export const FilterButtonGroup = styled.div`
  position: relative;
`;

interface FilterButtonProps {
  isActive?: boolean;
}

export const FilterButton = styled.button<FilterButtonProps>`
  background-color: ${(props) =>
    props.isActive ? COLORS.primaryLight : COLORS.white};
  border: 1px solid
    ${(props) => (props.isActive ? COLORS.primary : COLORS.grayBorder)};
  border-radius: 6px;
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: ${(props) => (props.isActive ? 600 : 500)};
  color: ${(props) => (props.isActive ? COLORS.primary : COLORS.black)};

  &:hover {
    opacity: 0.8;
  }
`;

export const ArrowIcon = styled.img`
  width: 12px;
  height: 12px;
`;

// Dropdown Menu
export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: ${COLORS.white};
  border: 1px solid ${COLORS.grayBorder};
  border-radius: 6px;
  overflow: hidden;
  z-index: 100;
  min-width: 150px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

interface DropdownItemProps {
  isSelected?: boolean;
}

export const DropdownItem = styled.div<DropdownItemProps>`
  padding: 12px 16px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.isSelected ? COLORS.primary : COLORS.black)};
  cursor: pointer;
  background-color: ${(props) =>
    props.isSelected ? COLORS.primaryLight : "transparent"};

  &:hover {
    background-color: ${COLORS.grayLight};
  }
`;

// Table Container
export const TableContainer = styled.div`
  width: 840px;
  background-color: ${COLORS.white};
  border: 1px solid ${COLORS.grayBorder};
  border-radius: 8px;
  z-index: 8;
  margin-bottom: 40px;
`;

// Table Header
export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 100px 120px 80px;
  align-items: center;
  padding: 16px 20px;
  background-color: ${COLORS.white};
  border-bottom: 1px solid ${COLORS.grayBorder};
  gap: 40px;
`;

export const TableHeaderCell = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.grayText};
`;

export const TableHeaderCellRight = styled(TableHeaderCell)`
  text-align: right;
`;

// Table Body
export const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

interface TableRowProps {
  isLast?: boolean;
}

export const TableRow = styled.div<TableRowProps>`
  display: grid;
  grid-template-columns: 50px 1fr 100px 120px 80px;
  align-items: center;
  padding: 16px 20px;
  border-bottom: ${(props) =>
    props.isLast ? "none" : `1px solid ${COLORS.grayBorder}`};
  background-color: ${COLORS.white};
  height: 60px;
  gap: 40px;

  &:hover {
    background-color: ${COLORS.grayLight};
    cursor: pointer;
  }

  ${(props) => props.isLast && `border-radius: 0 0 8px 8px;`}
`;

export const TableCell = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: ${COLORS.black};
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TableCellRight = styled(TableCell)`
  justify-content: flex-end;
`;

export const StatusIcon = styled.img`
  margin-left: 10px;
  width: 16px;
  height: 16px;
`;

interface DifficultyBadgeProps {
  level?: number;
}

export const DifficultyBadge = styled.span<DifficultyBadgeProps>`
  padding: 4px 10px;
  border-radius: 4px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  margin-right: 4px;
  background-color: ${(props) => {
    switch (props.level) {
      case 1:
        return "rgba(76, 175, 80, 0.1)";
      case 2:
        return "rgba(255, 193, 7, 0.1)";
      case 3:
        return "rgba(244, 67, 54, 0.1)";
      default:
        return "transparent";
    }
  }};
  color: ${(props) => {
    switch (props.level) {
      case 1:
        return "#4CAF50";
      case 2:
        return "#FFC107";
      case 3:
        return "#F44336";
      default:
        return COLORS.black;
    }
  }};
`;

export const DifficultyImage = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 6px;
`;

// Pagination
export const PaginationContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
`;

export const PaginationButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PaginationNumbers = styled.div`
  display: flex;
  gap: 12px;
`;

interface PaginationNumberProps {
  isActive?: boolean;
}

export const PaginationNumber = styled.button<PaginationNumberProps>`
  width: auto;
  min-width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => (props.isActive ? COLORS.grayText : COLORS.grayText2)};
  cursor: pointer;

  &:hover {
    color: ${COLORS.grayText};
  }
`;

// Footer

export const Footer = styled.footer`
  width: 100%;
  background: #f6f6f6;
  border-top: 1px solid #ededed;
  padding: 49px 40px;
  margin-top: auto;
`;

export const FooterContent = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const FooterLogoImage = styled.img`
  width: 100px;
  height: auto;
`;

export const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FooterText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #bdbdbd;
  white-space: nowrap;
`;

export const FooterLink = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #bdbdbd;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #828282;
  }
`;

export const FooterDivider = styled.span`
  color: #bdbdbd;
`;

export const FooterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SocialIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
`;

export const FooterCopyright = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #bdbdbd;
  margin: 0;
`;

export const Divider = styled.div`
  width: 1px;
  height: 14px;
  background-color: ${COLORS.grayText2};
`;

export const CopyRight = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${COLORS.grayText2};
  margin: 0;
`;

export const InstagramIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
