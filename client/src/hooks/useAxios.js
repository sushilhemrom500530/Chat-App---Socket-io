// // hooks/useAxios.js
// "use client";

// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import toast from "react-hot-toast";

// const axiosSecure = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_BASE_URL,
//   withCredentials: true, 
// });


// const useAxios = (logout) => {
//   const router = useRouter();

//   useEffect(() => {
//     const interceptor = axiosSecure.interceptors.response.use(
//       (res) => res,
//       async (error) => {
//         const status = error?.response?.status;

//         if (status === 401 || status === 403) {
//           if (typeof logout === "function") {
//             await logout();
//           }
//           toast.error("Your session has expired. Please log in again.");
//           router.push("/login");
//         }

//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axiosSecure.interceptors.response.eject(interceptor);
//     };
//   }, [logout, router]);

//   return axiosSecure;
// };

// export default useAxios;
