import { useRef } from 'react';
import { fetchApi } from './libs/api';

function App() {
  const currentProviderApi = fetchApi;
  const currentAbortController = useRef<AbortController | null>(null);

  const handleClick = async () => {
    try {
      if (currentAbortController.current) {
        currentAbortController.current.abort();
      }

      currentAbortController.current =
        currentProviderApi.createAbortController() as AbortController;

      const data = await currentProviderApi.get<unknown>('/posts', {
        signal: currentAbortController.current.signal,
      });
      console.log('API Response:', data);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <button
      onClick={() => {
        void handleClick();
      }}
    >
      click
    </button>
  );
}

export default App;
