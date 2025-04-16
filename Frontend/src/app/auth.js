import axios from "axios";
import baseUrl from "../utils/URL";

const checkAuth = async () => {
    const PUBLIC_ROUTES = ["login", "forgot-password", "register", "documentation"];
    const isPublicPage = PUBLIC_ROUTES.some(route => window.location.href.includes(route));

    try {
        // Make a request to protected route to verify auth
        const response = await axios.get(`${baseUrl}`+"/profile", { withCredentials: true }); // withCredentials allows sending cookies
        // console.log("Authenticated user:", response.data.user);

        // Setup global loading indicator
        axios.interceptors.request.use(config => {
            document.body.classList.add('loading-indicator');
            return config;
        }, error => {
            return Promise.reject(error);
        });

        axios.interceptors.response.use(response => {
            document.body.classList.remove('loading-indicator');
            return response;
        }, error => {
            document.body.classList.remove('loading-indicator');
            return Promise.reject(error);
        });

        return response.data.user;
    } catch (error) {
        if (!isPublicPage) {
            window.location.href = "/login";
        }
        return null;
    }
};

export default checkAuth;
