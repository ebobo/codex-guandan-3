const SERVER_URL =
  import.meta.env.MODE === 'development'
    ? `${window.location.protocol}//${window.location.hostname}:3030`
    : 'https://guandan-score-api.onrender.com';

export default SERVER_URL;
