import styled from 'styled-components';

const ResponsiveButton = styled.button`
  display: block;

  @media only screen and (min-width: 640px) {
    display: inline-block;
  }
`;

export default ResponsiveButton;
