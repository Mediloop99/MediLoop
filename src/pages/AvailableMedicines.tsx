import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Calendar, Pill } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface Medicine {
  id: string;
  name: string;
  medicineName: string;
  expiryDate: string;
  quantity: string;
  status: string;
  notes?: string;
}

const AvailableMedicines = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = () => {
    const donations = JSON.parse(localStorage.getItem("mediloop_donations") || "[]");
    const approvedMedicines = donations.filter((d: Medicine) => d.status === "approved");
    setMedicines(approvedMedicines);
  };

  const handleAccept = (medicineId: string) => {
    if (!recipientName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const donations = JSON.parse(localStorage.getItem("mediloop_donations") || "[]");
    const updated = donations.map((d: any) => 
      d.id === medicineId 
        ? { 
            ...d, 
            status: "accepted",
            acceptedBy: recipientName,
            acceptedAt: new Date().toLocaleDateString()
          } 
        : d
    );
    
    localStorage.setItem("mediloop_donations", JSON.stringify(updated));
    toast.success("Medicine accepted successfully!");
    setSelectedMedicine(null);
    setRecipientName("");
    loadMedicines();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => navigate("/recipient")}
            variant="ghost"
            size="icon"
            className="mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <img src={logo} alt="MediLoop" className="h-12 w-auto" />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Available Medicines</h1>
          <p className="text-muted-foreground">
            Browse verified and approved medicines ready for distribution
          </p>
        </div>

        {medicines.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No medicines available yet
            </h3>
            <p className="text-muted-foreground">
              Check back soon for newly approved donations
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {medicines.map((medicine) => (
              <Card key={medicine.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-6 h-6 text-success" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {medicine.medicineName}
                    </h3>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Expires: {medicine.expiryDate}
                      </div>
                      {medicine.quantity && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Package className="w-4 h-4 mr-2" />
                          Quantity: {medicine.quantity}
                        </div>
                      )}
                    </div>

                    {medicine.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {medicine.notes}
                      </p>
                    )}

                    {selectedMedicine === medicine.id ? (
                      <div className="mt-4 space-y-3">
                        <Input
                          placeholder="Enter your name"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => handleAccept(medicine.id)}
                          >
                            Confirm Accept
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedMedicine(null);
                              setRecipientName("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="mt-4 rounded-xl"
                        onClick={() => setSelectedMedicine(medicine.id)}
                      >
                        Accept Medicine
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableMedicines;
