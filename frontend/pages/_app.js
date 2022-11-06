import '../src/app/App.scss';
import 'notyf/notyf.min.css'; // for React, Vue and Svelte
import 'animate.css';

function MyApp({ Component, pageProps }) {
  if (typeof window === 'undefined') {
    return <Component {...pageProps} />;
  }
  return <Component {...pageProps} />
}

export default MyApp

