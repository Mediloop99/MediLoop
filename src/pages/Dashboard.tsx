import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Clock, Users, Check, X, Calendar, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface Donation {
  id: string;
  name: string;
  contact: string;
  medicineName: string;
  expiryDate: string;
  quantity: string;
  notes: string;
  status: string;
  submittedAt: string;
  acceptedBy?: string;
  acceptedAt?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = () => {
    const stored = JSON.parse(localStorage.getItem("mediloop_donations") || "[]");
    setDonations(stored);
  };

  const handleApprove = (id: string) => {
    const updated = donations.map(d => 
      d.id === id ? { ...d, status: "approved" } : d
    );
    localStorage.setItem("mediloop_donations", JSON.stringify(updated));
    setDonations(updated);
    toast.success("Medicine approved and available to recipients!");
  };

  const handleReject = (id: string) => {
    const updated = donations.map(d => 
      d.id === id ? { ...d, status: "rejected" } : d
    );
    localStorage.setItem("mediloop_donations", JSON.stringify(updated));
    setDonations(updated);
    toast.error("Medicine donation rejected");
  };

  const pendingMedicines = donations.filter(d => d.status === "pending");
  const acceptedMedicines = donations.filter(d => d.status === "accepted");
  const verifiedCount = donations.filter(d => d.status === "approved").length;
  const donorsCount = new Set(donations.map(d => d.contact)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img src={logo} alt="MediLoop" className="h-10 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">MediLoop</h1>
              <p className="text-sm text-muted-foreground">NGO Dashboard</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <Package className="w-5 h-5 text-success mb-2" />
              <div className="text-2xl font-bold">{verifiedCount}</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Clock className="w-5 h-5 text-warning mb-2" />
              <div className="text-2xl font-bold">{pendingMedicines.length}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Users className="w-5 h-5 text-accent mb-2" />
              <div className="text-2xl font-bold">{donorsCount}</div>
              <div className="text-xs text-muted-foreground">Donors</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Pending Approval</h3>

          {pendingMedicines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingMedicines.map((medicine) => (
                <Card key={medicine.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{medicine.medicineName}</h4>
                        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                          <div>Donor: {medicine.name} • {medicine.contact}</div>
                          <div>Expires: {medicine.expiryDate} • Qty: {medicine.quantity || "N/A"}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(medicine.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(medicine.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Accepted by Recipients Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Accepted by Recipients</h3>

          {acceptedMedicines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No medicines accepted yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {acceptedMedicines.map((medicine) => (
                <Card key={medicine.id} className="border-l-4 border-l-success">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{medicine.medicineName}</h4>
                        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                          <div>Donor: {medicine.name}</div>
                          <div>Accepted by: {medicine.acceptedBy}</div>
                          <div>Accepted on: {medicine.acceptedAt}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Accepted
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
