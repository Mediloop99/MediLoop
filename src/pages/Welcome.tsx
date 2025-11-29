import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background p-6 pb-12">
      <div className="flex flex-1 flex-col items-center justify-center space-y-8 text-center">
        <img src={logo} alt="MediLoop" className="h-24 w-auto" />
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Turning Unused Medicines<br />into Lifesaving Access
          </h1>
          
          <p className="text-lg text-muted-foreground px-4">
            A HealthTech initiative<br />
            connecting donors,<br />
            NGOs, and patients.
          </p>
        </div>

        <div className="w-full max-w-md space-y-4 pt-8">
          <Button
            onClick={() => navigate("/scan")}
            className="w-full h-14 text-lg font-semibold rounded-2xl"
            size="lg"
          >
            Continue as Donor
          </Button>
          
          <Button
            onClick={() => navigate("/recipient")}
            variant="secondary"
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-success hover:bg-success/90 text-success-foreground"
            size="lg"
          >
            Continue as Recipient
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground pt-8">
        Powered by<br />
        MediLoop Technologies
      </p>
    </div>
  );
};

export default Welcome;
