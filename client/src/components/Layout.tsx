import { Container } from '@chakra-ui/react';
import Navbar from './Navbar';

const Layout: React.FC = ({ children }) => {
  return (
    <>
      <Navbar />
      <Container maxW='5xl' mt={5}>
        {children}
      </Container>
    </>
  );
};

export default Layout;
