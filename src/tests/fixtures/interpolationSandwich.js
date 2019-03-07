import styled from 'styled-components'

const stringify = (key, val) => `${key}: ${val};`

export default styled.span`
  && {
    ${() => stringify('background-color', 'red')};

    ${() => stringify('font-size', '12px')};

    color: pink;

    ${() => stringify('display', 'flex')};

    &:hover {
      color: red;
    }
  }
`;
