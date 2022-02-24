import React, { useState, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
// import PersonIcon from '@mui/icons-material/Person';
// import AddIcon from '@mui/icons-material/Add';
import Typography from "@mui/material/Typography";
import { blue } from "@mui/material/colors";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import InputLabel from "./InputLabel";
import { useAuth } from "../contexts/AuthContext";
import CustomizedSnackbars from "./Snackbar";
// import { useFirestore } from "../contexts/FirestoreContext";
function SimpleDialog(props) {
  var email = props.email;
  // email = getClubReadyEmail();
  console.log(email);
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };
  const handleAddAccount = () => {
    props.setAddAccount(true);
  };

  const handleListItemClick = (email, pwd) => {
    onClose(email, pwd);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Set Club Ready account</DialogTitle>
      <List sx={{ pt: 0 }}>
        {/* <ListItem button onClick={() => handleListItemClick(email)} key={email}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={email} />
          </ListItem> */}
        {email
          ? email.map((email) => (
              <ListItem
                button
                onClick={() => handleListItemClick(email.email, email.password)}
                key={email.email}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                    {/* <PersonIcon /> */}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={email.email} />
              </ListItem>
            ))
          : null}

        <ListItem autoFocus button onClick={handleAddAccount}>
          <ListItemAvatar>
            <Avatar>{/* <AddIcon /> */}</Avatar>
          </ListItemAvatar>
          <ListItemText primary="Add account" />
        </ListItem>
      </List>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

export default function ClubReadyAccountSelector(props) {
  const [open, setOpen] = React.useState(false);
  const [addAccount, setAddAccount] = React.useState(false);
  const {
    currentUser,
    db,
    getCurrentUserUID,
    getClubReadyLogins,
    currentClubReadyLogin,
    setCurrentClubReadyLogin,
  } = useAuth();
  const [selectedValue, setSelectedValue] = useState("Add Account");
  const [email, setEmail] = useState([
    { email: "email1", password: "password1" },
  ]);
  const [snackbar, setSnackbar] = useState();

  useEffect(async () => {
    let accounts = await getClubReadyLogins();
    if (accounts === false) {
      setSelectedValue("Add Account");
    } else {
      setSelectedValue(accounts[0].email);
      setCurrentClubReadyLogin({
        email: accounts[0].email,
        password: accounts[0].password,
      });
    }
  }, []);

  const doesClubReadyAccountExist = () => {};
  const setDefaultClubReadyAccount = () => {};

  const handleClickOpen = async () => {
    setEmail(await getClubReadyLogins());
    setOpen(true);
  };
  const handleClose = (email, pwd) => {
    setOpen(false);
    setSelectedValue(email);
    setCurrentClubReadyLogin({ email: email, password: pwd });
  };
  const handleAddAccountClose = () => {
    setAddAccount(false);
  };
  const [formInput, setFormInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      password: "",
      email: "",
    }
  );
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    let data = { formInput };

    console.log(
      "Adding Club Ready User: ",
      data.formInput.email,
      " ",
      data.formInput.password
    );
    // e.preventDefault();

    // Add Club Ready login info to collection users in uid document
    try {
      const userRef = await db.collection("users").add({
        email: data.formInput.email,
        password: data.formInput.password,
        uid: getCurrentUserUID(),
      });
      console.log("userRef: ", userRef);
    } catch (e) {
      console.log("Failed adding club ready account. Error: ", e);
      handleSetSnackbar("error", "Failed adding club ready account");
    }

    setEmail(await getClubReadyLogins());
    handleSetSnackbar("success", "Club Ready Account successfully added!");
  };
  const handleSetSnackbar = (severity, message) => {
    setSnackbar(
      <CustomizedSnackbars open={true} severity={"success"}>
        Club Ready Account successfully added!
      </CustomizedSnackbars>
    );
  };
  const handleInput = (evt) => {
    const name = evt.target.name;
    const newValue = evt.target.value;
    setFormInput({ [name]: newValue });
  };
  return (
    <div style={{ marginBottom: "1em" }}>
      <InputLabel>Select Club Ready Account</InputLabel>
      <ListItem button onClick={handleClickOpen} key={selectedValue}>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
            {/* <PersonIcon /> */}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={selectedValue} />
      </ListItem>
      <SimpleDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
        setAddAccount={setAddAccount}
        email={email}
      />

      <Dialog onClose={() => setAddAccount(false)} open={addAccount}>
        {snackbar}
        <DialogTitle>Add Club Ready Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Use the information associated with the Club Ready account you setup
            for PayWell.
          </DialogContentText>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <TextField
              label="Username"
              name="email"
              defaultValue={formInput.name}
              // helperText="e.g. name@gmail.com"
              onChange={handleInput}
              id="outlined-basic"
              variant="outlined"
              style={{ marginTop: "1em" }}
            />
            <TextField
              label="Password"
              name="password"
              defaultValue={formInput.name}
              // helperText="Enter Passowrd"
              onChange={handleInput}
              id="outlined-basic"
              variant="outlined"
              style={{ marginTop: "1em" }}
            />
            <DialogActions sx={{ marginTop: "1em" }}>
              <Button onClick={handleAddAccountClose}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
