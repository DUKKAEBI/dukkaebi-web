import * as S from "./styles";
import ducamiLogo from "../../assets/image/main/ducami_logo.svg";
import instagramIcon from "../../assets/image/main/mdi_instagram.svg";

const INSTAGRAM_URL = "https://www.instagram.com/duco_ami/";

export const Footer = () => {
  return (
    <S.Footer>
      <S.FooterContent>
        <S.FooterTop>
          <S.FooterLogo src={ducamiLogo} alt="Ducami Logo" />
        </S.FooterTop>
        <S.FooterInfo>
          <S.FooterText>두카미</S.FooterText>
          <S.FooterText>대구광역시 달성군 구지면 창리로11길 93</S.FooterText>
          <S.FooterText>ducami@dgsw.hs.kr</S.FooterText>
          <S.FooterLinks>
            <S.FooterLink>서비스 이용약관</S.FooterLink>
            <S.FooterLink>개인정보 처리방침</S.FooterLink>
          </S.FooterLinks>
        </S.FooterInfo>
        <S.FooterBottom>
          <S.Copyright>© 2025 두카미. All rights reserved.</S.Copyright>
          <S.SocialLink
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <S.SocialIcon src={instagramIcon} alt="Instagram" />
          </S.SocialLink>
        </S.FooterBottom>
      </S.FooterContent>
    </S.Footer>
  );
};
