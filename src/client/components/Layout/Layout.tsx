import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Button from "../Button";
import Breadcrumbs, { Crumb } from "../Breadcrumbs";
import { colors, fontWeights } from "../../constants";

const MainColumn = styled.main`
  flex: 1;
  order: 2;
  padding-top: 32px;
  min-width: 250px;
`;
const LeftColumn = styled.aside`
  flex-basis: 250px;
  order: 1;
  align-self: flex-start;
  position: sticky;
  top: 0;
  padding-top: 32px;
  border-top: 8px solid ${colors.primary};
`;
const Header = styled.header``;
const Wrapper = styled.div`
  display: flex;
  gap: 64px;
  padding: 32px;
  padding-top: 0;
  max-width: 1400px;
  margin: auto;
`;
const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: ${fontWeights.medium};
`;

interface ErrorFallbackProps {
  resetErrorBoundary: () => void;
}

const ErrorWrapper = styled.div``;

const ErrorDescription = styled.p`
  white-space: pre-line;
`;

const ErrorFallback = ({ resetErrorBoundary }: ErrorFallbackProps) => (
  <ErrorWrapper>
    <ErrorDescription>Something failed while fetching packages!</ErrorDescription>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </ErrorWrapper>
);

const Layout = () => {
  const { packageName } = useParams();

  const logError = (error: Error) => {
    console.error(error);
  };

  return (
    <Wrapper>
      <MainColumn>
        <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
          <Outlet />
        </ErrorBoundary>
      </MainColumn>
      <LeftColumn>
        <Header>
          <Title>Package browser</Title>
          <Breadcrumbs>
            <Crumb to="/">All packages</Crumb>
            {packageName && <Crumb to={packageName}>{packageName}</Crumb>}
          </Breadcrumbs>
        </Header>
      </LeftColumn>
    </Wrapper>
  );
};

export default Layout;
