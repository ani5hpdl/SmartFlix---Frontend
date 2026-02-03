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

const config = {
    headers : {
        'authorization' : `Bearer ${localStorage.getItem("token")}`
    }
}

export const createUserApi = (data) => Api.post("/api/auth/register",data);

export const login = (data) => Api.post("/api/auth/login",data);

export const verify = (data) => Api.get(`/api/auth/verify?token=${data}`);

export const getAllMovies = () => Api.get("/api/movies/getmovies");

export const getMoviesWithFilters = (data) => Api.get(`/api/movies/filtermovies?genres=${data.genres}&yearFrom=${data.yearFrom}&yearTo=${data.yearTo}&minRating=${data.minRating}&maxRating=${data.maxRating}`);

export const createUser = (data) => Api.post("/api/user/createUser",data,config);

export const updateUser = (id,data) => Api.post(`/api/user/updateUser/${id}`,data,config);

export const getALlUser = () => Api.get(`/api/user/getUsers`,config);

export const getUserById = (id) => Api.get(`/api/user/getUserById/${id}`,config); 