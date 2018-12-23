import styled from 'styled-components';

export default styled.input`
  && {
    border: ${props => props.borderWidth} solid ${props => props.borderColor};
  }
`;
