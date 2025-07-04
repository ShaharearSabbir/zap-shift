import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
import SocialLogins from "../SocialLogins/SocialLogins";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { signinUser } = useAuth();

  const onSubmit = ({ email, password }) => {
    signinUser(email, password)
      .then(() => {
        navigate(location.state || "/");
      })
      .catch((err) => console.log(err.message));
  };
  return (
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div className="card-body">
        <h1 className="text-5xl font-bold">Please Login!</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="input"
              placeholder="Email"
            />
            {errors.email?.type === "required" && (
              <p className="text-sm text-red-500">Email is required</p>
            )}

            <label className="label">Password</label>
            <input
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              className="input"
              placeholder="Password"
            />
            {errors.password?.type === "required" && (
              <p className="text-sm text-red-500">Password is required</p>
            )}
            {errors.password?.type === "minLength" && (
              <p className="text-sm text-red-500">Minimum 6 character</p>
            )}
            <div>
              <a className="link link-hover">Forgot password?</a>
            </div>
            <button className="btn btn-primary text-base-content mt-4">
              Login
            </button>
          </fieldset>
        </form>
        <p>
          New Here?{" "}
          <Link
            to="/register"
            className="text-primary hover:font-bold btn btn-link"
          >
            Register
          </Link>
        </p>
        <SocialLogins state={location.state} />
      </div>
    </div>
  );
};

export default Login;
