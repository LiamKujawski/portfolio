import * as React from "react";
import { useEffect } from "react";
import { useStudioScrapeStatus } from "../contexts/StudioScrapeStatusContext";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  createClasses,
  compileEventArrays,
} from "../contexts/ReportCompilerContext";

export default function VerticalLinearStepper(props) {
  const { isScrapeComplete, isContinueButtonDisabled, setIsContinueButtonDisabled } = useStudioScrapeStatus();
  var steps = props.steps;
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  function handleCompileReports() {
    compileEventArrays();
    createClasses();
  }

  useEffect(() => {
    // console.log("isScrapeComplete(VertticalLinearStepper", isScrapeComplete);
  });
  return (
    <Box sx={{ maxWidth: "532px" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === steps.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mb: 2 }}>
                <div>
                  {/* If isManualUpload == false and second to last step */}
                  {index === steps.length - 2 && !props.isManualUpload ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Scrape
                    </Button>
                  ) : // First Step
                  index === 0 ? (
                    <Button
                      variant="contained"
                        onClick={handleNext}
                        disabled={isContinueButtonDisabled}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Continue
                    </Button>
                  ) : // Last Step
                  index === steps.length - 1 ? (
                    <>
                      <Button
                        disabled={!isScrapeComplete}
                        variant="contained"
                        onClick={handleCompileReports}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Download
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </>
                  ) : (
                    // Every Step beside first last and last
                    <>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={isContinueButtonDisabled}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continue
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </>
                  )}
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}
