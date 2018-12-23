import styled from 'styled-components';

export default styled.button`
  padding: ${props => props.padding};

  & + & {
    margin-left: ${props => props.spaceBetween};
  }
`;
