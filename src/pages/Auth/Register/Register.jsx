import React from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router";
import SocialLogins from "../SocialLogins/SocialLogins";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const { createUser } = useAuth();

  const onSubmit = (data) => {
    createUser(data.email, data.password)
      .then(() => navigate(location.state || "/"))
      .catch((err) => console.log(err.message));
  };
  return (
    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
      <div className="card-body">
        <h1 className="text-5xl font-bold">Create Account!</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              {...register("email", { required: true })}
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
              <p className="text-sm text-red-500">
                Password must have 6 character
              </p>
            )}
            <button className="btn btn-primary text-base-content mt-4">
              Register
            </button>
          </fieldset>
        </form>
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:font-bold btn btn-link"
          >
            Login
          </Link>
        </p>
        <SocialLogins state={location.state} />
      </div>
    </div>
  );
};

export default Register;
