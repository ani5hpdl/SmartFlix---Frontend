import axios from 'axios';

const ApiFormData = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL,
    withCredentials : true,
    headers : {
        "Content-Type" : "multipart/form-data",
    },
});

const Api = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL,
    withCredentials : true,
    headers : {
        "Content-Type" : "application/json"
    }
});

const authConfig = () => ({
    headers: {
        authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
});

export const createUserApi = (data) => Api.post("/api/auth/register",data);

export const login = (data) => Api.post("/api/auth/login",data);
export const getMe = () => Api.get("/api/auth/getMe", authConfig());

export const verify = (data) => Api.get(`/api/auth/verify?token=${data}`);

export const getAllMovies = (params = {}) => Api.get("/api/movies/getmovies", { params });

export const getMoviesWithFilters = (data) => Api.get(`/api/movies/filtermovies?genres=${data.genres}&yearFrom=${data.yearFrom}&yearTo=${data.yearTo}&minRating=${data.minRating}&maxRating=${data.maxRating}`);

export const getMovieById = (data) => Api.get(`api/movies/getMovieById/${data}`);

export const createUser = (data) => Api.post("/api/user/createUser",data,authConfig());

export const updateUser = (id,data) => Api.post(`/api/user/updateUser/${id}`,data,authConfig());

export const getALlUser = () => Api.get(`/api/user/getUsers`,authConfig());

export const getUserById = (id) => Api.get(`/api/user/getUserById/${id}`,authConfig()); 

export const importMovies = () => Api.get("/api/movies/import",authConfig());
export const deleteAllMovies = () => Api.delete("/api/movies/delete-all", authConfig());

export const getAllReviewsAdmin = () => Api.get("/api/review/getAllReviews", authConfig());

export const deleteReviewById = (id) => Api.delete(`/api/review/deleteReview/${id}`, authConfig());

export const addReview = (data) => Api.post("/api/review/addReview", data, authConfig());

export const updateReviewById = (id, data) => Api.post(`/api/review/updateReview/${id}`, data, authConfig());

export const getReviewsByUser = (userId) => Api.get(`/api/review/getReviewsByUser/${userId}`);
