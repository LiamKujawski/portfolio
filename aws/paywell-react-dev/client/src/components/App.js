import React from "react";
import Signup from "./Signup";
// import { Container } from "react-bootstrap"
// import Container from '@mui/material/Container';
import Box from "@mui/material/Box";
import { AuthProvider } from "../contexts/AuthContext";
import { StudioScrapeStatusProvider } from "../contexts/StudioScrapeStatusContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import ClubReadyUser from "./ClubReadyUser";
// import { FireStoreProvider } from "../contexts/FirestoreContext";

function App() {
  
  return (
    <Box component="div" sx={{ border: "1px grey" }}>
      <Router>
        <AuthProvider>
          {/* <FireStoreProvider> */}
          <StudioScrapeStatusProvider>
            {/* Switch is to determined which route we are currently on */}
            <Switch>
              <PrivateRoute exact path="/" component={Dashboard} />
              <PrivateRoute path="/update-profile" component={UpdateProfile} />
              <PrivateRoute path="/link-clubready" component={ClubReadyUser} />
              <Route path="/signup" component={Signup} />
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={ForgotPassword} />
            </Switch>
            </StudioScrapeStatusProvider>
            {/* </FireStoreProvider> */}
        </AuthProvider>
      </Router>
    </Box>
  );
}

export default App;
