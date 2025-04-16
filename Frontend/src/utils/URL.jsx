const protocol = window.location.protocol;
const hostname = window.location.hostname;
const protocolAndHostname = protocol + "//" + hostname;
const baseUrl = `${protocolAndHostname}:4000`

// const baseUrl = `http://10.10.192.6:8080`;

export default   baseUrl;