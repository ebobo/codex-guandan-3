const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  `${window.location.protocol}//${window.location.hostname}:3000`;

export default SERVER_URL;
