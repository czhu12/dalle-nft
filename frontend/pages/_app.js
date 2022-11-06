import '../src/app/App.scss';

function MyApp({ Component, pageProps }) {
  if (typeof window === 'undefined') {
    return <Component {...pageProps} />;
  }
  return <Component {...pageProps} />
}

export default MyApp

