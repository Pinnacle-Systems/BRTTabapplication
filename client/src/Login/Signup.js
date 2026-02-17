import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../redux/userservice";
import logo from "../img/123.png";
import "./signup.css";
import useLogout, { loginSocket } from "../CustomHooks copy/useLogout";
import { generateSessionId } from "../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import Garment from "../img/sewing.png";
import Hospital from "../img/hosp.png";
import Lab from "../img/obs.png";
import Cloud from "../img/cl.png";
import Cus from "../img/cus.png";
import Computer from "../img/computer.png";

const solutions = [
  { name: "ERP for Textile Industries", icon: Garment },
  { name: "Hospital Management", icon: Hospital },
  { name: "ERP for Textile Lab", icon: Lab },
  { name: "Cloud & IoT Solution Provider", icon: Cloud },
  { name: "Customized Software Solutions", icon: Cus },
  { name: "Computer Hardware Solutions", icon: Computer },
];

function Signup({autoLogout}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  useLogout();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await loginUser({ username, password }).unwrap();
      console.log(data, "data");

      if (data.message === "Login Successful") {
        loginSocket(data?.user);
        sessionStorage.setItem("sessionId", generateSessionId());
        secureLocalStorage.setItem(
          sessionStorage.getItem("sessionId") + "token",
          data.token
        );
        localStorage.setItem("userName", username);
        sessionStorage.setItem("userName", username);
        autoLogout(sessionStorage.getItem("sessionId"))
        navigate("/branch-finyear");
      } else {
        setError("Login failed, please try again.");
      }
    } catch (error) {
      setError(error.data ? error.data.message : error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-3">
                Welcome Back
              </h1>
              <p className="text-sm text-indigo-100 text-justify">
                Pinnacle Systems provides modern, cloud-based and easy-to-use
                software solutions for Apparel & Textile Industries. We
                specialise in enabling fashion manufacturing, sourcing and
                retailing companies to improve their lead times, costs and
                performance through technology .
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <h3 className="text-white text-lg font-semibold mb-4">
                Our Solutions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {solutions.map((solution, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-2 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-200"
                  >
                    <div className="bg-white bg-opacity-20 p-1 rounded mr-2">
                      <img
                        src={solution.icon}
                        alt={solution.name}
                        className="w-5 h-5"
                      />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {solution.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <div className="h-1 w-12 bg-white bg-opacity-30 mb-2"></div>
              <p className="text-indigo-200 text-xs">
                Trusted by industry leaders worldwide
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#03A454]">
BRT Sizing Mill        </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-w-md mx-auto w-full"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Login to Your Account
                </h2>
                <p className="text-gray-500 text-xs">
                  Enter your credentials to continue
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition duration-200"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none transition duration-200"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-xs text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-xs">
                    <a
                      href="#"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow transition duration-200 flex items-center justify-center ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      ></path>
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-xs">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Get started
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
