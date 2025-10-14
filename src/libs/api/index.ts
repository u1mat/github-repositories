import FetchAdapter from './adapters/fetch-adapter';
import ApiBase from './api-base';

export const fetchApi = new ApiBase('https://jsonplaceholder.typicode.com', new FetchAdapter());
