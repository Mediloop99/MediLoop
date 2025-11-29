import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hospital } from "lucide-react";
import logo from "@/assets/logo.png";

const Recipient = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <img src={logo} alt="MediLoop" className="h-16 w-auto mx-auto mb-4" />
        
        <h1 className="text-5xl font-bold text-primary mb-2">
          MediLoop
        </h1>

        <h2 className="text-3xl font-bold text-primary mb-6">
          Welcome, Recipient
        </h2>

        <p className="text-lg text-muted-foreground leading-relaxed px-4">
          Through MediLoop, you can safely access medicines donated by verified donors and approved by NGOs or clinics. You don't need to sign up — just browse available medicines and request what you need.
        </p>

        <div className="flex justify-center my-12">
          <div className="w-48 h-48 flex items-center justify-center">
            <Hospital className="w-full h-full text-accent" strokeWidth={1.5} />
          </div>
        </div>

        <Button
          onClick={() => navigate("/available-medicines")}
          className="h-14 px-12 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90 mx-auto"
          size="lg"
        >
          View Available Medicines
        </Button>
      </div>
    </div>
  );
};

export default Recipient;
