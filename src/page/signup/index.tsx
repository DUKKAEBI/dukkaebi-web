import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as S from "./style";
import iconMessage from "../../assets/image/auth/Message.png";
import iconChat from "../../assets/image/auth/Chat.png";
import iconHide from "../../assets/image/auth/Hide.png";
import iconFilled from "../../assets/image/auth/Filled.png";

// Main Component
export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    nickname: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/auth/sign-up`, {
        loginId: formData.id,
        password: formData.password,
        nickname: formData.nickname,
      });

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    navigate("/login");
  };

  return (
    <S.LoginContainer>
      <S.LeftSection>
        <S.Title>회원가입</S.Title>
        <S.Subtitle>서비스에 가입하려면 회원가입 하세요.</S.Subtitle>

        <form onSubmit={handleLogin}>
          <S.FormGroup>
            <S.InputWrapper>
              <S.InputIcon src={iconMessage} alt="ID icon" />
              <S.Input
                id="id"
                name="id"
                type="text"
                placeholder="ID"
                value={formData.id}
                onChange={handleInputChange}
                required
              />
            </S.InputWrapper>
          </S.FormGroup>

          <S.FormGroup>
            <S.PasswordInputWrapper>
              <S.InputIcon src={iconChat} alt="Password icon" />
              <S.Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <S.TogglePasswordBtn
                type="button"
                onClick={handleTogglePassword}
                aria-label="Toggle password visibility"
              >
                <S.PasswordToggleIcon
                  src={showPassword ? iconFilled : iconHide}
                  alt="Toggle password"
                />
              </S.TogglePasswordBtn>
            </S.PasswordInputWrapper>
          </S.FormGroup>

          <S.FormGroup>
            <S.PasswordInputWrapper>
              <S.InputIcon src={iconChat} alt="Nickname icon" />
              <S.Input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="Nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                required
              />
              <S.TogglePasswordBtn
                type="button"
                onClick={handleTogglePassword}
                aria-label="Toggle password visibility"
              ></S.TogglePasswordBtn>
            </S.PasswordInputWrapper>
          </S.FormGroup>

          <S.FormGroup>
            <S.LoginButton type="submit" disabled={isLoading}>
              {isLoading ? "회원가입중..." : "회원가입"}
            </S.LoginButton>
          </S.FormGroup>
        </form>

        <S.SignupSection>
          <S.SignupText>이미 계정이 있으신가요?</S.SignupText>
          <S.SignupLink type="button" onClick={handleSignup}>
            로그인
          </S.SignupLink>
        </S.SignupSection>
      </S.LeftSection>

      <S.RightSection />
    </S.LoginContainer>
  );
}
