import styled from "styled-components";
import { FC } from "react";
import { Link } from "react-router-dom";
import { colors } from "../../constants";

const CrumbWrapper = styled.div`
  &:not(:first-of-type) {
    margin-left: 8px;
    &::before {
      content: "/";
      margin-right: 8px;
      color: ${colors.gray[300]};
    }
  }
`;

const CrumbLink = styled(Link)`
  color: ${colors.gray[700]};
  text-decoration: none;
  &:hover {
    color: ${colors.gray[900]};
  }
`;

const Wrapper = styled.nav`
  display: flex;
  font-size: 0.875rem;
`;

const Breadcrumbs: FC = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

interface CrumbProps {
  to: string;
}

export const Crumb: FC<CrumbProps> = ({ to, children, ...rest }) => {
  return (
    <CrumbWrapper>
      <CrumbLink to={to} {...rest}>
        {children}
      </CrumbLink>
    </CrumbWrapper>
  );
};

export default Breadcrumbs;
