import styled from 'styled-components';

// 문제 타입 정의
interface Problem {
  id: number;
  number: string;
  title: string;
  status: 'submitted' | 'not-submitted';
}

// 목업 데이터
const MOCK_PROBLEMS: Problem[] = [
  { id: 1, number: '01', title: '숫자야구', status: 'not-submitted' },
  { id: 2, number: '02', title: '문자열과 알파벳 쿼리', status: 'submitted' },
  { id: 3, number: '03', title: '문자열과 알파벳 쿼리', status: 'submitted' },
  { id: 4, number: '04', title: '문자열과 알파벳 쿼리', status: 'submitted' },
  { id: 5, number: '05', title: '문자열과 알파벳 쿼리', status: 'not-submitted' },
  { id: 6, number: '06', title: '문자열과 알파벳 쿼리', status: 'not-submitted' },
  { id: 7, number: '07', title: '문자열과 알파벳 쿼리', status: 'submitted' },
  { id: 8, number: '08', title: '문자열과 알파벳 쿼리', status: 'submitted' },
];

const ContestDetailPage = () => {
  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <LogoImage src="https://i.ibb.co/ycw6HTQF/image.png" alt="DUKKAEBI Logo" />
            <Nav>
              <NavItem $active={false}>문제풀기</NavItem>
              <NavItem $active={true}>알고리즘 대회</NavItem>
            </Nav>
          </HeaderLeft>
          <UserIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="#828282" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            </svg>
          </UserIcon>
        </HeaderContent>
      </Header>

      {/* Contest Info Section */}
      <ContestInfoSection>
        <ContestInfoContent>
          {/* Contest Image */}
          <ContestImage src="https://i.ibb.co/bgdgkTBG/image.png" alt="DGSW 프로그래밍 대회" />
          
          {/* Contest Details */}
          <ContestDetails>
            <div style={{display: 'flex',flexDirection:'column', gap: 12}}>
              <ContestTitle>DGSW 프로그래밍 대회</ContestTitle>
            <ContestDescription>
              <DescriptionText>
                DGSW 프로그래밍 대회는 교육봉사 동아리 '두카미'에서 진행하는<br />
                알고리즘 대회 입니다.
              </DescriptionText>
              <ContestMeta>2025.11.10 ~ 2025.11.14 ・100명 참여중</ContestMeta>
            </ContestDescription>
            </div>
            
            
            {/* Progress Bar */}
            <ProgressSection>
              <ProgressBarContainer>
                <ProgressBar progress={10} />
              </ProgressBarContainer>
              <ProgressText>10% 진행</ProgressText>
            </ProgressSection>
          </ContestDetails>
        </ContestInfoContent>
      </ContestInfoSection>

      {/* Main Content Area */}
      <MainContentArea>
        {/* Problems List */}
        <ProblemsSection>
          <ProblemsTable>
            {/* Table Header */}
            <TableHeader>
              <TableHeaderLeft>
                <HeaderCell>번호</HeaderCell>
                <HeaderCell>제목</HeaderCell>
              </TableHeaderLeft>
              <TableHeaderRight>
                <HeaderCell>제출 상태</HeaderCell>
              </TableHeaderRight>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {MOCK_PROBLEMS.map((problem, index) => (
                <TableRow key={problem.id} $isLast={index === MOCK_PROBLEMS.length - 1}>
                  <ProblemNumber>{problem.number}</ProblemNumber>
                  <ProblemTitle>{problem.title}</ProblemTitle>
                  <ProblemStatus $status={problem.status}>
                    {problem.status === 'submitted' ? '제출 완료' : '미제출'}
                  </ProblemStatus>
                </TableRow>
              ))}
            </TableBody>
          </ProblemsTable>
        </ProblemsSection>

        {/* Contest Info Card */}
        <ContestInfoCard>
          <CardContent>
            <CardInfo>
              <CardTitle>DGSW 프로그래밍 대회</CardTitle>
              <CardDetails>
                <CardDetail>시작 일시 : 2025년 11월 14일 12:00</CardDetail>
                <CardDetail>코딩 테스트 시간 : 30분</CardDetail>
                <CardDetail>총 10문제</CardDetail>
              </CardDetails>
            </CardInfo>
            
            <StartButton>코딩테스트 시작하기</StartButton>
          </CardContent>
        </ContestInfoCard>
      </MainContentArea>
    </Container>
  );
};

export default ContestDetailPage;

// Styled Components
const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #F6F6F6;
  overflow-x: hidden;
`;

const Header = styled.header`
  width: 100%;
  height: 80px;
  background: #FFFFFF;
  border-bottom: 1px solid #EDEDED;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

const LogoImage = styled.img`
  width: 80px;
  object-fit: contain;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavItem = styled.a<{ $active: boolean }>`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${props => props.$active ? '#00B4B7' : '#1D1D1D'};
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: #00B4B7;
  }
`;

const UserIcon = styled.div`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const ContestInfoSection = styled.section`
  width: 100%;
  background: #FFFFFF;
  border-bottom: 1px solid #EDEDED;
  padding: 50px 0;
  display: flex;
  justify-content: center;
`;

const ContestInfoContent = styled.div`
  width: 100%;
  display: flex;
  gap: 40px;
  align-items: center;
  padding: 0 80px;
`;

const ContestImage = styled.img`
  width: 387px;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
`;

const ContestDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 4px 0;
`;

const ContestTitle = styled.h1`
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: #000000;
  margin: 0;
`;

const ContestDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DescriptionText = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #BDBDBD;
  margin: 0;
  line-height: 1.4;
`;

const ContestMeta = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #BDBDBD;
  margin: 0;
`;

const ProgressSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: #E0E0E0;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.progress}%;
  background-color: #00B4B7;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #BDBDBD;
  white-space: nowrap;
`;

const MainContentArea = styled.main`
  width: 100%;
  padding: 36px 80px;
  display: flex;
  gap: 20px;
  margin-bottom: 80px;
  align-items: flex-start;
`;

const ProblemsSection = styled.section`
  flex: 1;
  min-width: 700px;
`;

const ProblemsTable = styled.div`
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #EDEDED;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #EDEDED;
`;

const TableHeaderLeft = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
  width: 90px;
`;

const TableHeaderRight = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
`;

const HeaderCell = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #828282;
  white-space: nowrap;
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableRow = styled.div<{ $isLast: boolean }>`
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  padding: 20px;
  background: #FFFFFF;
  border-bottom: ${props => props.$isLast ? 'none' : '1px solid #EDEDED'};
  min-height: 60px;

  ${props => props.$isLast && `
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  `}
`;

const ProblemNumber = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #00B4B7;
`;

const ProblemTitle = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #1D1D1D;
`;

const ProblemStatus = styled.span<{ $status: 'submitted' | 'not-submitted' }>`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: ${props => props.$status === 'submitted' ? '#00B4B7' : '#BDBDBD'};
  text-align: right;
`;

const ContestInfoCard = styled.aside`
  width: 400px;
  background: #FFFFFF;
  border: 1px solid #EDEDED;
  border-radius: 8px;
  padding: 24px 20px;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CardTitle = styled.h2`
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #000000;
  margin: 0;
`;

const CardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardDetail = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #828282;
  margin: 0;
`;

const StartButton = styled.button`
  width: 100%;
  background: #00B4B7;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-family: 'Pretendard', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #FFFFFF;
  cursor: pointer;
  transition: background 0.2s;
  outline: none;

  &:hover {
    background: #009A9D;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: none;
  }
`;
