import styled, { css } from 'styled-components';

const displayBlockMixin = css`
  display: block;
`;

export default styled.div`
  ${displayBlockMixin}

  position: relative;

  &:hover {
    opacity: 1;
  }
`;
