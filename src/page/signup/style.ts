import styled from "styled-components";
import imgRectangle350 from "../../assets/image/auth/authSide.png";

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 105px;
  background-color: #ffffff;
`;

const RightSection = styled.div`
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${imgRectangle350});
    background-size: cover;
    background-position: center;
    opacity: 1;
  }
`;

const Title = styled.h1`
  font-family: "Pretendard", sans-serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
  color: #444444;
  margin: 0 0 20px 0;
`;

const Subtitle = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: #828282;
  margin: 0 0 60px 0;
`;

const FormGroup = styled.div`
  width: 526px;
  margin-bottom: 40px;
  position: relative;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: #888888;
  display: block;
  margin-bottom: 12px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.img`
  position: absolute;
  left: 16px;
  width: 24px;
  height: 24px;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  height: 67px;
  padding: 0 16px 0 56px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  background-color: #ffffff;
  transition: all 0.3s ease;
  color: black;

  &:focus {
    outline: none;
    border-color: #00b4b7;
    box-shadow: 0 0 0 3px rgba(0, 180, 183, 0.1);
  }

  &::placeholder {
    color: #bdbdbd;
  }
`;

const PasswordInputWrapper = styled(InputWrapper)`
  position: relative;
`;

const TogglePasswordBtn = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  &:hover {
    opacity: 0.7;
  }
`;

const PasswordToggleIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const LoginButton = styled.button`
  width: 526px;
  height: 66px;
  background-color: #00b4b7;
  border: none;
  border-radius: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;

  &:hover {
    background-color: #009093;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SignupSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const SignupText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #828282;
  margin: 0;
`;

const SignupLink = styled.button`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #00b4b7;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin: 0;

  &:hover {
    color: #009093;
  }
`;

export {
  LoginContainer,
  LeftSection,
  RightSection,
  Title,
  Subtitle,
  FormGroup,
  Label,
  InputWrapper,
  InputIcon,
  Input,
  PasswordInputWrapper,
  TogglePasswordBtn,
  PasswordToggleIcon,
  LoginButton,
  SignupSection,
  SignupText,
  SignupLink,
};
