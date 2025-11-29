import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Donate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    medicineName: "",
    expiryDate: "",
    quantity: "",
    notes: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Image uploaded successfully");
    }
  };

  const extractInfoFromImage = () => {
    toast.info("Extracting information from image...");
    // Simulate extraction
    setTimeout(() => {
      toast.success("Information extracted!");
      setFormData(prev => ({ 
        ...prev, 
        medicineName: "Paracetamol 500mg",
        expiryDate: "12/2026"
      }));
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.medicineName || !formData.contact) {
      toast.error("Please fill in all required fields (Name, Contact, Medicine Name)");
      return;
    }

    // Save to localStorage
    const donations = JSON.parse(localStorage.getItem("mediloop_donations") || "[]");
    const newDonation = {
      id: Date.now().toString(),
      ...formData,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    donations.push(newDonation);
    localStorage.setItem("mediloop_donations", JSON.stringify(donations));

    toast.success("Donation submitted for NGO verification!");
    setTimeout(() => navigate("/scan"), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="mr-4"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <img src={logo} alt="MediLoop" className="h-12 w-auto" />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
            <Heart className="w-8 h-8 text-success" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Donate Medicine</h1>
          <p className="text-muted-foreground text-lg">
            Help someone in need by donating unused medicines
          </p>
        </div>

        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Important:</strong> After submitting, your donation will be reviewed by our team and verified NGO partners before distribution.
          </p>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border-2 border-dashed border-primary/30 bg-background">
            <Label className="text-base font-semibold block mb-3">
              Medicine Photo (Recommended)
            </Label>
            
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Medicine" className="w-full h-48 object-cover rounded-xl mb-3" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 bg-accent/10 rounded-xl border-2 border-dashed border-accent/30 cursor-pointer hover:bg-accent/20 transition-colors"
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  Tap to upload medicine photo<br />
                  <span className="text-xs">Strip, bottle, or package</span>
                </p>
              </div>
            )}

            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreview && (
              <Button
                type="button"
                variant="secondary"
                onClick={extractInfoFromImage}
                className="w-full h-12 mt-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Extract info from image
              </Button>
            )}
          </Card>

          <div>
            <Label htmlFor="name" className="text-base font-semibold mb-2 block">
              Your Name *
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div>
            <Label htmlFor="contact" className="text-base font-semibold mb-2 block">
              Contact Number *
            </Label>
            <Input
              id="contact"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicineName" className="text-base font-semibold mb-2 block">
                Medicine Name *
              </Label>
              <Input
                id="medicineName"
                placeholder="Paracetamol 500mg"
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="expiryDate" className="text-base font-semibold mb-2 block">
                Expiry Date *
              </Label>
              <Input
                id="expiryDate"
                placeholder="12/2026"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity" className="text-base font-semibold mb-2 block">
              Quantity
            </Label>
            <Input
              id="quantity"
              placeholder="20 tablets / 100ml"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-2 block">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about the medicine..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-24 rounded-xl resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-16 text-lg font-semibold rounded-2xl bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success"
          >
            <Heart className="w-5 h-5 mr-2" />
            Submit Donation
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
