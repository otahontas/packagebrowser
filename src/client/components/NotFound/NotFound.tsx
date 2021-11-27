import styled from "styled-components";
import { fontWeights } from "../../constants";

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: ${fontWeights.medium};
`;
const Wrapper = styled.div`
  padding-top: 64px;
  margin: auto;
  width: fit-content;
`;

const NotFound = () => (
  <Wrapper>
    <Title>404 - Not found</Title>
  </Wrapper>
);

export default NotFound;
