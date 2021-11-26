import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { colors, fontWeights } from "../../constants";
import Breadcrumbs, { Crumb } from "../Breadcrumbs";

const MainColumn = styled.main`
  flex: 1;
  order: 2;
  padding-top: 32px;
`;
const LeftColumn = styled.aside`
  flex-basis: 248px;
  order: 1;
  align-self: flex-start;
  position: sticky;
  top: 0;
  padding-top: 32px;
  border-top: 8px solid ${colors.secondary};
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

const Layout = () => {
  const { packageName } = useParams();

  return (
    <Wrapper>
      <MainColumn>
        <Outlet />
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
