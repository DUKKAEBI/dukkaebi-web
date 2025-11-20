import styled from "styled-components";

// Footer Styles
export const Footer = styled.footer`
  width: 100%;
  background: #f6f6f6;
  border-top: 1px solid #ededed;
  padding: 49px 0;
`;

export const FooterContent = styled.div`
  padding: 0 40px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FooterTop = styled.div`
  display: flex;
  align-items: center;
`;

export const FooterLogo = styled.img`
  height: 18px;
`;

export const FooterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FooterText = styled.span`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: 12px;
`;

export const FooterLink = styled.a`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #828282;
  }
`;

export const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Copyright = styled.div`
  color: #bdbdbd;
  font-size: 14px;
  font-weight: 500;
`;

export const SocialIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
