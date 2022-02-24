import React, { useReducer } from "react";
import { Button, Icon, TextField, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export default function MaterialUIFormSubmit(props) {
  const useStyles = makeStyles(theme => ({
    button: {
      margin: theme.spacing(1)
    },
    leftIcon: {
      marginRight: theme.spacing(1)
    },
    rightIcon: {
      marginLeft: theme.spacing(1)
    },
    iconSmall: {
      fontSize: 20
    },
    root: {
      padding: theme.spacing(3, 2)
    },
    container: {
      display: "flex",
      flexWrap: "wrap"
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 400
    }
  }));

  const [formInput, setFormInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      password: "",
      email: ""
    }
  );

  const handleSubmit = evt => {
    evt.preventDefault();

    let data = { formInput };

    console.log(data)
  }

  const handleInput = evt => {
    const name = evt.target.name;
    const newValue = evt.target.value;
    setFormInput({ [name]: newValue });
  };

  const classes = useStyles();

  return (
    <div>
        <Typography variant="h5" component="h3">
          {props.formName}
        </Typography>
        <Typography component="p">{props.formDescription}</Typography>

        <form onSubmit={handleSubmit}>
                 <TextField
            label="Email"
            name="email"
            defaultValue={formInput.name}
            className={classes.textField}
            // helperText="e.g. name@gmail.com"
            onChange={handleInput}
             id="outlined-basic"  variant="outlined" style={{marginTop: "1em"}}
          />
          <TextField
            label="Password"
            name="password"
            defaultValue={formInput.name}
            className={classes.textField}
            // helperText="Enter Passowrd"
            onChange={handleInput}
            id="outlined-basic"  variant="outlined" style={{marginTop: "1em"}}
          />
   
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Subscribe <Icon className={classes.rightIcon}>send</Icon>
          </Button>
        </form>
    </div>
  );
}
