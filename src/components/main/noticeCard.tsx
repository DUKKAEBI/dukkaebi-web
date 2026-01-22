import * as S from "./styles";

interface NoticeCardProps {
  title: string;
  author: string;
  date: string;
  content: string;
  fileUrl?: string;
  onClick?: () => void;
}

const NoticeCard = ({
  title,
  author,
  date,
  content,
  fileUrl,
  onClick,
}: NoticeCardProps) => {
  return (
    <S.CardContainer onClick={onClick}>
      <S.HeaderSection>
        <S.Title>{title}</S.Title>
        <S.InfoGroup>
          <S.InfoText>{author}</S.InfoText>
          <S.Divider />
          <S.InfoText>{date}</S.InfoText>
        </S.InfoGroup>
      </S.HeaderSection>

      <S.Content>{content}</S.Content>

      {fileUrl && <S.Attachment>(첨부파일)</S.Attachment>}
    </S.CardContainer>
  );
};

export default NoticeCard;
