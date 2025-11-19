import styled from "styled-components";

export const Header = styled.header`
  width: 100%;
  height: 80px;
  background: white;
  border-bottom: 1px solid #ededed;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  height: 100%;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderLeft = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 40px;
`;

export const Logo = styled.div`
  width: 80px;
  height: 32px;
  gap: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

export const NavLink = styled.a`
  color: #1d1d1d;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #00b4b7;
  }
`;

export const UserIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
