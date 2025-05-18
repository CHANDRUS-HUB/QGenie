const protocol = window.location.protocol;
const hostname = window.location.hostname;
const protocolAndHostname = protocol + "//" + hostname;
const baseUrl = `${protocolAndHostname}:7000`

// const baseUrl = `http://10.10.192.123:7000`;

export default   baseUrl;