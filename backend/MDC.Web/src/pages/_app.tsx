import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { ThemeProvider, CssBaseline, alpha } from '@mui/material';
import theme from '../theme';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ModeSwitch from '@/components/ModeSwitch';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import AppNavbar from '@/components/AppNavbar';
import { AuthProvider } from '../contexts/AuthContext';
import { PublicEnvScript } from 'next-runtime-env';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
      
      <title>TechArk</title>
      <meta name="description" content="Micro Data Center" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          {/* <TopNavigation /> */}
          <SideMenu />
          {/* <AppNavbar /> */}
          <Box
            component="main"
            sx={(theme) => ({
              // flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: 'auto',
            })}
          >
            <Component {...pageProps}/>
            {/* <Stack spacing={2} sx={{ alignItems: 'center', mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}> */}
              {/* <Header /> */}

              {/* <ModeSwitch /> */}
              

              {/* <MainGrid /> */}
            {/* </Stack> */}
          </Box>        
        </Box>
      </ThemeProvider>
    </AuthProvider>   
    </> 
  );
}
