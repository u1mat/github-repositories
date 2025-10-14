import { useEffect } from 'react';
import { fetchApi } from './libs/api';

function App() {
  const currentProviderApi = fetchApi;
  useEffect(() => {
    void (async () => {
      try {
        const data = await currentProviderApi.get('/posts');
        console.log(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    })();
  }, [currentProviderApi]);
  return <></>;
}

export default App;
