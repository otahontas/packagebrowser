import styled from "styled-components";
import { colors } from "../../constants";

const Button = styled.button`
  border-radius: 4px;
  padding: 4px;
  color: ${props => (props.disabled ? colors.gray[300] : colors.primary)};
  background-color: ${colors.white};
  border: 2px solid currentColor;

  &:hover {
    background-color: ${props => !props.disabled && colors.gray[100]};
  }
`;

export default Button;
