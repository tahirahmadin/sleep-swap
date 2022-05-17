//done
import React from "react";
import { Typography, Slide } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Close } from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  background: {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.2)",
  },
  container: {
    width: "100%",
    height: "fit-content",
    padding: 10,
    minHeight: 400,
    maxWidth: 540,
    position: "relative",
    background: "#fff",
    border: "15px solid #6A55EA",
    display: "flex",
    alignItems: "center",
    zIndex: 11,
    [theme.breakpoints.down("md")]: {
      border: "10px solid #D1FE1D",
      width: "100%",
      maxWidth: "95%",
      height: 350,
    },
    [theme.breakpoints.down("sm")]: {
      height: "max-content",
    },
  },
  closeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    height: 22,
    width: 22,
    cursor: "pointer",
    [theme.breakpoints.down("md")]: {
      top: 5,
      right: 5,
      height: 18,
      width: 18,
    },
  },
  inputWrapper: {
    padding: 10,
  },
  input: {
    backgroundColor: "#ffffff",
    border: "1px solid #757575",
    borderRadius: 18,
    width: "80%",
    padding: 6,
    outline: "none",
    color: "#212121",
    textAlign: "left",
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
    fontFamily: "Karla",
  },
  heading: {
    color: "#000000",
    textAlign: "center",
    fontSize: 30,
    lineHeight: "20%",
    [theme.breakpoints.down("md")]: {
      fontSize: 24,
    },
  },

  para: {
    color: "#212121",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 300,
    paddingTop: 5,
    [theme.breakpoints.down("md")]: {
      fontSize: 13,
      paddingTop: 15,
    },
  },
  activateButton: {
    width: "fit-content",
    height: "50px",
    background: "#FF5AFF",
    boxSizing: "border-box",
    borderRadius: "15px",
    fontSize: 16,
    lineHeight: "33px",
    color: "#ffffff",
    fontWeight: 700,

    padding: "12px 30px 12px 30px",
    "&:hover": {
      background: "#FFB469",
    },
    [theme.breakpoints.down("md")]: {
      padding: "12px 20px 12px 20px",
      fontSize: 18,
    },
  },
  explorerButton: {
    width: "fit-content",

    background: "transparent",
    border: "1px solid #FFFFFF",
    boxSizing: "border-box",
    borderRadius: "15px",
    fontSize: 16,
    lineHeight: "33px",
    color: theme.palette.primary.main,
    fontWeight: 500,
    marginTop: 20,
    padding: "10px 40px 10px 40px",
    "&:hover": {
      background: theme.palette.primary.main,
    },
    [theme.breakpoints.down("md")]: {
      padding: "12px 20px 12px 20px",
      fontSize: 18,
    },
  },
  registerButton: {
    width: "fit-content",
    height: "45px",
    background: "#FF87FF",
    border: "1px solid #FFFFFF",
    boxSizing: "border-box",
    borderRadius: "20px",
    fontSize: 16,
    lineHeight: "33px",
    color: "#000000",

    marginTop: 20,
    padding: "12px 30px 12px 30px",
    "&:hover": {
      background: "#FFB469",
    },
    [theme.breakpoints.down("md")]: {
      padding: "12px 20px 12px 20px",
      fontSize: 18,
    },
  },

  svgImage: {
    width: 100,
    [theme.breakpoints.down("md")]: {
      width: 70,
    },
  },
  spoon1Image: {
    width: 40,
    height: "fit-content",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  spoon2Image: {
    width: 30,
    height: "fit-content",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  iconWrapper: {
    marginRight: 10,
    backgroundColor: "#FF87FF",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 42,
    height: 42,
  },
  icon: {
    width: 25,
    height: 25,
    color: "white",
  },
}));

const TxPopup = ({ txCase, hash, resetPopup }) => {
  const classes = useStyles();

  return (
    <div className="h-100 w-100">
      {txCase === 1 && (
        <div
          className="h-100 w-100 d-flex flex-column justify-content-between"
          style={{ minHeight: 400 }}
        >
          <div
            className="d-flex justify-content-end align-items-start"
            onClick={resetPopup}
          >
            <Close style={{ cursor: "pointer" }} />
          </div>
          <div>
            <div className="text-center">
              <img
                src="https://cdn3d.iconscout.com/3d/premium/thumb/hourglass-4029229-3337928.png"
                alt="Waiting"
                height="150px"
              />
            </div>

            <div className="my-2">
              <Typography
                variant="h5"
                className={classes.heading}
                textAlign="center"
                fontWeight={600}
                fontSize={22}
              >
                Waiting for Confirmation
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={400}
                fontSize={14}
              >
                Confirm the transaction in Metamask to make <br />
                strategy working.
              </Typography>
            </div>
          </div>
          <div></div>
        </div>
      )}
      {txCase === 2 && (
        <div
          className="h-100 w-100 d-flex flex-column justify-content-between"
          style={{ minHeight: 400 }}
        >
          <div className="d-flex justify-content-end" onClick={resetPopup}>
            <Close style={{ cursor: "pointer" }} />
          </div>
          <div>
            <div className="text-center">
              <img
                src="https://cdn3d.iconscout.com/3d/premium/thumb/shopping-offer-time-4408277-3663982.png"
                alt="Submitted"
                height="150px"
              />
            </div>
            <div className="my-2">
              {" "}
              <Typography
                variant="h5"
                className={classes.heading}
                textAlign="center"
                fontWeight={600}
                fontSize={22}
              >
                Transaction Submit
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={400}
                fontSize={14}
              >
                Transaction is submitted and we are creating <br />
                your space in the pool.
              </Typography>
            </div>

            <div className="text-center mt-2">
              <a
                className={classes.explorerButton}
                href={`https://kovan.etherscan.io/tx/${hash}`}
                target="_blank"
              >
                View On Explorer
              </a>
            </div>
          </div>
          <div></div>
        </div>
      )}
      {txCase === 3 && (
        <div
          className="h-100 w-100 d-flex flex-column justify-content-between"
          style={{ minHeight: 400 }}
        >
          <div className="d-flex justify-content-end" onClick={resetPopup}>
            <Close style={{ cursor: "pointer" }} />
          </div>
          <div>
            <div className="text-center">
              <img
                src="https://cliply.co/wp-content/uploads/2020/06/422006060_BALLOONS_3D_ICON_400px.gif"
                alt="success"
                height="150px"
              />
            </div>
            <div className="my-2">
              {" "}
              <Typography
                variant="h5"
                className={classes.heading}
                textAlign="center"
                fontWeight={600}
                fontSize={22}
              >
                Stake Successful!
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={400}
                fontSize={14}
              >
                Congratulations! your strategy is ready to give you yeilds
                <br /> while you sleep.
              </Typography>
            </div>

            <div className="text-center mt-2">
              <a
                className={classes.explorerButton}
                href={`https://kovan.etherscan.io/tx/${hash}`}
                target="_blank"
              >
                View On Explorer
              </a>
            </div>
          </div>
          <div></div>
        </div>
      )}
      {txCase === 4 && (
        <div
          className="h-100 w-100 d-flex flex-column justify-content-between"
          style={{ minHeight: 400 }}
        >
          <div className="d-flex justify-content-end" onClick={resetPopup}>
            <Close style={{ cursor: "pointer" }} />
          </div>
          <div>
            <div className="text-center">
              <img
                src="https://cdn3d.iconscout.com/3d/premium/thumb/no-security-4128252-3580506.png"
                alt="failed"
                height="150px"
              />
            </div>

            <div className="my-2">
              <Typography
                variant="h5"
                className={classes.heading}
                textAlign="center"
                fontWeight={600}
                fontSize={22}
              >
                Oops! Stake Failed!
              </Typography>
              <Typography
                variant="body2"
                className={classes.para}
                textAlign="center"
                fontWeight={400}
                fontSize={14}
              >
                Sorry, Something went wrong and we are not able to <br /> give
                you space in the pool.
              </Typography>
            </div>

            <div className="text-center mt-2">
              <a
                className={classes.explorerButton}
                href={`https://kovan.etherscan.io/tx/${hash}`}
                target="_blank"
              >
                View On Explorer
              </a>
            </div>
          </div>
          <div></div>
        </div>
      )}
    </div>
  );
};

export default TxPopup;
