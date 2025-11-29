import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import logo from "@/assets/logo.png";

interface ResultState {
  status: "verified" | "failed" | "warning";
  expiryDate?: Date;
  reason?: string;
  message?: string;
}

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState || { status: "failed" };

  const renderContent = () => {
    switch (state.status) {
      case "verified":
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-20 h-20 text-success" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Medicine Verified</h2>
            <p className="text-lg text-muted-foreground text-center px-4">
              The medicine is verified<br />and safe to use
            </p>
            {state.expiryDate && (
              <p className="text-sm text-muted-foreground">
                Expires: {new Date(state.expiryDate).toLocaleDateString()}
              </p>
            )}
            <Button
              onClick={() => navigate("/donate")}
              className="w-full max-w-md h-14 text-lg font-semibold rounded-2xl mt-8"
            >
              OK
            </Button>
          </div>
        );

      case "warning":
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-20 h-20 text-warning" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-warning">Near Expiry</h2>
            <p className="text-lg text-muted-foreground text-center px-4">
              {state.message || "Medicine is nearing expiration. Use with caution."}
            </p>
            {state.expiryDate && (
              <p className="text-sm text-muted-foreground">
                Expires: {new Date(state.expiryDate).toLocaleDateString()}
              </p>
            )}
            <div className="w-full max-w-md space-y-3 mt-8">
              <Button
                onClick={() => navigate("/scan")}
                className="w-full h-14 text-lg font-semibold rounded-2xl"
              >
                OK
              </Button>
              <Button
                onClick={() => navigate("/donate")}
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-2xl"
              >
                Donate to NGO
              </Button>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-20 h-20 text-destructive" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-destructive">Verification Failed</h2>
            <p className="text-lg text-foreground text-center px-4 font-semibold">
              This medicine could not be verified.<br />Do not use it.
            </p>
            <div className="bg-muted rounded-2xl p-6 max-w-md">
              <p className="text-sm text-muted-foreground">
                <strong>Possible reasons:</strong> {state.reason || "blurry image, unrecognized batch, or missing database match."}
              </p>
            </div>
            <div className="w-full max-w-md space-y-3 mt-4">
              <Button
                variant="outline"
                className="w-full h-14 text-lg font-semibold rounded-2xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Report to NGO
              </Button>
              <Button
                onClick={() => navigate("/scan")}
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-2xl"
              >
                Discard / Don't Use
              </Button>
              <Button
                onClick={() => navigate("/scan")}
                variant="ghost"
                className="w-full h-12 text-base font-semibold rounded-2xl text-primary"
              >
                Scan another medicine
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <img src={logo} alt="MediLoop" className="h-16 w-auto mx-auto mb-12" />
        <div className="text-center">
          <h1 className="text-xl font-semibold text-muted-foreground mb-8">Verification Result</h1>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Result;
