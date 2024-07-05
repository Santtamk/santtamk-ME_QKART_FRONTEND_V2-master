import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  // debugger;
  const { enqueueSnackbar } = useSnackbar();


  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const handleChange = (event) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }));
  };
  const register = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${config.endpoint}/auth/register`,  {  
        username: formData.username,
        password: formData.password
      })
      if (response.status === 201 && response.data.success) {
        console.log(response.data);
        enqueueSnackbar('Registered successfully', { variant: 'success' });
        history.push('/login')
      } else {
        const errorMessage = response.data.message || 'Registration failed!';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else {
        enqueueSnackbar('Something went wrong. Check that the backend is running, reachable, and returns valid JSON.', { variant: 'error' });
      }
      console.error('Registration not posted', error);
    }
    setIsLoading(false);
  };

 

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = () => {
    if(formData.username === ""){
      enqueueSnackbar('Username is a required field', { variant: 'error' });
      return false;
    }else if(formData.username.length < 6){
      enqueueSnackbar('Username must be at least 6 characters', { variant: 'error' });
      return false;
    }else if(formData.password === ""){
      enqueueSnackbar('Password is a required field', { variant: 'error' });
      return false;
    }else if(formData.password.length < 6){
      enqueueSnackbar('Password must be at least 6 characters', { variant: 'error' });
      return false;
    }else if(formData.password !== formData.confirmPassword){
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return false;
    }else{
     return true;
    }
  };

  const renderButtonContent = () => {
    if(isLoading){
      return <CircularProgress size={24} />
    }else{
      return 'Register Now'
    }
  }; 
   const handleRegister = (event) => {
    event.preventDefault();
    if(validateInput()){
      register();
    }
  };
  

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <Button
            className="button"
            variant="contained"
            onClick={handleRegister}
            disabled={isLoading}
          >
           {renderButtonContent()}
          </Button>
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
